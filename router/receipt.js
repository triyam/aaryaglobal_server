const express = require('express')
const { response } = require('express')
const { default: mongoose } = require('mongoose')
const router = express.Router()
require('../db/conn')
const Buffer = require('buffer').Buffer
const fs = require('fs')
const upload = require('../middleware/multer')
const authenticate = require('../middleware/authenticate')
const Receipt = require('../model/receiptSchema')

router.post('/receiptUpload', upload.single('file'), async (req, res) => {
  const data = fs.readFileSync(req.file.path, 'utf8')
  const base64pdf = Buffer.from(data).toString('base64')
  const receipt = await new Receipt({
    receipt: base64pdf,
  }).save()
  fs.unlinkSync(req.file.path)
  res.status(200).send({ message: 'success' })
})

module.exports = router
