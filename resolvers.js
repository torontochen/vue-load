const mongoose = require('mongoose')

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
    }
  }

  // Mutations

  // Subscriptions
}
