const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
    },
    isSelf: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    images: [{}],
    html: {
      type: String,
    },
  },
  { timestamps: true }
)

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
