const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
)

const Banner = mongoose.model('Banner', bannerSchema)

module.exports = Banner
