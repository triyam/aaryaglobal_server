const mongoose = require('mongoose')

const ReceiptSchema = new mongoose.Schema({
  receipt: {
    type: Buffer,
  },
})

const Receipt = mongoose.model('Receipt', ReceiptSchema)

module.exports = Receipt
