const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const fs = require("fs")

mongoose.set('useFindAndModify', false)
const conn = mongoose.connection

// Upload file Dir
const DOWNLOAD_DIR = "download"

// Create-token function
const createToken = (user, secret, expiresIn) => {
  const {
    username,
    email
  } = user
  return jwt.sign({
    username,
    email
  }, secret, {
    expiresIn
  })
}

module.exports = {
  // Queries
  Query: {
    getPics: async (_, args, {
      Picture
    }) => {
      const pictures = await Picture.find({})
        .sort({
          createdDate: 'desc'
        })
        .populate({
          path: 'createdBy',
          model: 'User'

        })
      return pictures
    },

    getCurrentUser: async (_, args, {
      User,
      currentUser
    }) => {
      if (!currentUser) {
        return null
      }
      const user = await User.findOne({
        username: currentUser.username
      })
      return user
    }
  },


  // Mutations
  Mutation: {
    addPic: async (_, {
      title,
      imageId,
      imageFilename,
      creatorId,
      imageBase64
    }, {
      Picture,
      pubsub
    }) => {
      await new Picture({
        title,
        imageId,
        imageFilename,
        createdBy: creatorId,
        imageBase64
      }).save()


      const addedPic = await Picture.findOne({
        imageFilename
      }).populate({
        path: "createdBy",
        model: "User"
      })

      // Broadcast the subscription
      pubsub.publish("PIC_ADDED", {
        picAdded: addedPic
      })

      return addedPic
    },

    deletePic: async (_, {
      picId,
      username
    }, {
      Picture,
      pubsub
    }) => {
      const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: username
      })
      const deletePic = await Picture.findOne({
        _id: picId
      }).populate({
        path: 'createdBy',
        model: "User"
      })
      await gridFSBucket.delete(deletePic.imageId)

      // Publish subscription
      pubsub.publish("PIC_DELETED", {
        picDeleted: deletePic
      })

      const pic = Picture.findOneAndRemove({
        _id: picId
      })
      return pic
    },

    signupUser: async (_, {
      username,
      email,
      password
    }, {
      User
    }) => {
      const user = await User.findOne({
        username
      })
      if (user) {
        throw new Error('User already exists')
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save()
      const token = createToken(newUser, process.env.SECRET, "2hr")
      return {
        token
      }
    },

    signinUser: async (_, {
      username,
      password
    }, {
      User
    }) => {
      const user = await User.findOne({
        username
      })
      if (!user) {
        throw new Error("User not found")
      }
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new Error("Invalid Password")
      }
      return {
        token: createToken(user, process.env.SECRET, "2hr")
      }
    },

    uploadImage: async (_, {
      file,
      username
    }, info) => {
      const {
        createReadStream,
        filename,
        mimetype,
        encoding
      } = await file
      const stream = createReadStream()
      const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: username
      })
      const newFilename = username + '-' + Date(Date.now()).toString() + '-' + filename
      const uploadStream = gridFSBucket.openUploadStream(newFilename, {
        chunkSizeBytes: 100000
      })
      await new Promise((resolve, reject) => {
        stream
          .pipe(uploadStream)
          .on("error", reject)
          .on("finish", resolve)
      })
      return {
        id: uploadStream.id,
        filename: newFilename,
        mimetype,
        encoding
      }
    },

    downloadImage: async (_, {
      filename,
      username
    }, info) => {
      const firstDash = filename.indexOf('-')
      const bucketName = filename.slice(0, firstDash)
      const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName
      })
      const newFilename = filename => {
        const posLast = filename.lastIndexOf('-')
        const file = filename.slice(posLast + 1)
        const newfilename = username + '-' + file
        return newfilename
      }
      const downloadPath = `${DOWNLOAD_DIR}/${newFilename(filename)}`
      const downloadStream = gridFSBucket.openDownloadStreamByName(filename)

      setTimeout(() => {
        downloadStream
          .pipe(fs.createWriteStream(downloadPath))
          .on("error", error => {
            console.log("Some error occured in download:" + error)
          })
          .on("finish", () => {
            console.log("download is finished")
          })
      }, 500)


      return {
        fileDir: newFilename(filename)
      }


    }
  },


  // Subscriptions
  Subscription: {
    picAdded: {
      subscribe: (_, args, {
        pubsub
      }) => {
        console.log("picAdded subscription is running")
        return pubsub.asyncIterator(["PIC_ADDED"])
      }
    },

    picDeleted: {
      subscribe: (_, args, {
        pubsub
      }) => {
        console.log("picDeleted subscription is running")
        return pubsub.asyncIterator(["PIC_DELETED"])
      }
    }
  }
}
