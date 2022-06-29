const express = require('express')
const { response } = require('express')
const router = express.Router()
require('../db/conn')
const User = require('../model/userSchema')
const authenticate = require('../middleware/authenticate')

router.get('/userDetails', authenticate, async (req, res) => {
  let details = {}
  try {
    details = await User.findOne({ _id: req.userID }).select({
      username: 1,
      email: 1,
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }
  res.status(200).send(details)
})

module.exports = router
