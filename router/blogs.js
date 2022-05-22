const express = require('express')
const { response } = require('express')
const router = express.Router()
require('../db/conn')
const authenticate = require('../middleware/authenticate')
const imageToBase64 = require('image-to-base64')
const User = require('../model/userSchema')
const Blog = require('../model/blogSchema')
const multer = require('multer')

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '--' + file.originalname)
  },
})
const upload = multer({ storage: storageEngine })

router.post(
  '/blogpost',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    const { title, description, file } = req.body
    if (!title || !description) {
      return res.status(422).json({ error: 'Some data fields are missing' })
    }
    const type = req.body.type
    try {
      if (type === 'self') {
        const base64FormattedImage = await imageToBase64(req.file.path)
        const blog = await new Blog({
          isSelf: true,
          user_id: req.userID,
          title: title,
          description: description,
          image: base64FormattedImage,
        }).save()
      } else {
        // HTML file upload
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' })
      console.log(error)
    }

    res.status(200).json({ message: 'Succefully posted the blog' })
  }
)

module.exports = router
