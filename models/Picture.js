const mongoose = require('mongoose')

const PicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageBase64: {
    type: String
  },
  imageFilename: {
    type: String
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: 'User'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Picture', PicSchema)
