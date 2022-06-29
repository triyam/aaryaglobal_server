const express = require('express')
const { response } = require('express')
const router = express.Router()
require('../db/conn')
const authenticate = require('../middleware/authenticate')
const imageToBase64 = require('image-to-base64')
const User = require('../model/userSchema')
const Blog = require('../model/blogSchema')
const multer = require('multer')
const fs = require('fs')

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '--' + file.originalname)
  },
})
const upload = multer({ storage: storageEngine })

router.post('/blogpost', authenticate, upload.any(), async (req, res) => {
  const base64FormattedImages = []
  const convertToBase64 = async () => {
    for (let i = 0; i < req.files.length; i++) {
      base64FormattedImages.push(await imageToBase64(req.files[i].path))
      fs.unlinkSync(req.files[i].path)
    }
  }
  const { title, description, type } = req.body

  try {
    if (type === 'self') {
      // self written blog
      if (req.files) {
        await convertToBase64()
      }
      if (!title || !description) {
        return res.status(402).json({ error: 'Some data fields are missing' })
      }

      const blog = await new Blog({
        isSelf: true,
        user_id: req.userID,
        title: title,
        description: description,
        images: base64FormattedImages,
      }).save()
    } else if (type === 'html') {
      // HTML file upload
      if (!title) {
        return res.status(422).json({ error: 'title is missing' })
      }
      const data = fs.readFileSync(req.files[0].path, 'utf8')
      const blog = await new Blog({
        isSelf: false,
        user_id: req.userID,
        title: title,
        html: data,
      }).save()
      fs.unlinkSync(req.files[0].path)
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(err)
  }

  res.status(200).json({ message: 'Succefully posted the blog' })
})

router.get('/blogs', async (req, res) => {
  let allBlogs
  try {
    allBlogs = await Blog.find({})
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }

  res.status(200).send(allBlogs)
})

router.get('/blogs/:blogid', async (req, res) => {
  let blog = {}
  try {
    blog = await Blog.findOne({ _id: req.params.blogid })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }
  res.status(200).send(blog)
})

module.exports = router
