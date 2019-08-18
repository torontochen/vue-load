const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")

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
    }
  }


  // Subscriptions
}
