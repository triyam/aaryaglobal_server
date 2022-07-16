const express = require('express')
const router = express.Router()
require('../db/conn')
const authenticate = require('../middleware/authenticate')
const imageToBase64 = require('image-to-base64')
const User = require('../model/userSchema')
const SiteReview = require('../model/siteReviewSchema')
const upload = require('../middleware/multer')
const fs = require('fs')

router.post('/siteReviewPost', authenticate, upload.any(), async (req, res) => {
  const base64FormattedImages = []
  const convertToBase64 = async () => {
    for (let i = 0; i < req.files.length; i++) {
      base64FormattedImages.push(await imageToBase64(req.files[i].path))
      fs.unlinkSync(req.files[i].path)
    }
  }
  const { siteName, review, location } = req.body
  try {
    if (req.files) {
      await convertToBase64()
    }
    if (!siteName || !review || !location) {
      return res.status(402).json({ error: 'Some data fields are missing' })
    }

    const siteReview = await new SiteReview({
      user_id: req.userID,
      siteName: siteName,
      location: location,
      review: review,
      images: base64FormattedImages,
    }).save()
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(err)
  }

  res.status(200).json({ message: 'Successfully posted your Review' })
})

router.get('/siteReviews', async (req, res) => {
  let allReviews
  try {
    allReviews = await SiteReview.find({})
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }

  res.status(200).send(allReviews)
})

router.get('/siteReviews/:location', async (req, res) => {
  let reviews
  try {
    reviews = await SiteReview.find({ location: req.params.location })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'Internal server error' })
  }
  res.status(200).send(reviews)
})

router.get('/siteReview/:reviewId', async (req, res) => {
  let Review = {}
  try {
    Review = await SiteReview.findOne({ _id: req.params.reviewId })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }
  res.status(200).send(Review)
})

module.exports = router
