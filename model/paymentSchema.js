const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    serviceType: {
      type: String,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNo: {
      type: Number,
    },
    serviceName: {
      type: String,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
)

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment
