const mongoose = require('mongoose')

const siteReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    siteName: {
      type: String,
    },
    review: {
      type: String,
    },
    images: [{}],
  },
  { timestamps: true }
)

const SiteReview = mongoose.model('SiteReview', siteReviewSchema)

module.exports = SiteReview
