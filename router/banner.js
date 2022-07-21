const express = require('express')
const { response } = require('express')
const router = express.Router()
require('../db/conn')
const authenticate = require('../middleware/authenticate')
const User = require('../model/userSchema')
const Banner = require('../model/bannerSchema')
const upload = require('../middleware/multer')
const fs = require('fs')

router.post('/bannerpost', authenticate, async (req, res) => {
  const { title, description } = req.body
  if (!title || !description) {
    return res.status(402).send({ message: 'data fields are missing' })
  }
  try {
    const banner = await new Banner({
      title: title,
      description: description,
      user_id: req.userId,
    }).save()
  } catch (err) {
    return res.status(500).send({ message: 'Internal server error' })
  }
  return res.status(200).json({ message: 'Successfully posted the banner' })
})

router.get('/banners', async (req, res) => {
  let banners
  try {
    banners = await Banner.find({})
  } catch (err) {
    res.status(500).send({ message: 'Internal server error' })
  }
  return res.status(200).send(banners)
})

router.get('/banners/:bannerid', async (req, res) => {
  let banner
  try {
    banner = await Banner.findOne({ _id: req.params.bannerid })
  } catch (err) {
    return res.status(500).send({ message: 'Internal server error' })
  }
  return res.status(200).send(banner)
})

module.exports = router
