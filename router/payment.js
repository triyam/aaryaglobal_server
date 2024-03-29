const express = require('express')
const { response } = require('express')
const router = express.Router()
require('../db/conn')
const authenticate = require('../middleware/authenticate')
const User = require('../model/userSchema')
const Payment = require('../model/paymentSchema')
const { v4: uuidv4 } = require('uuid')
const { stat } = require('fs')
const stripe = require('stripe')(
  'sk_test_51L5sgiSFNeBq9B3CAW2F5WAvv1dOKtDRg3lQYDZEbcYce7jgFnUyC3325G1O6oJNt3ZvoJKFbuP5xWLO3UySwXf700EukmaaT8'
)

// router.post('/payment', authenticate, (req, res) => {
//   const { details, token } = req.body
//   console.log(req.body)
//   const idempotencyKey = uuidv4()

//   try {
//     return stripe.customers
//       .create({
//         email: token.email,
//         source: token.id,
//       })
//       .then((customer) => {
//         stripe.charges.create(
//           {
//             amount: details.price * 100,
//             currency: 'USD',
//             customer: customer.id,
//             receipt_email: token.email,
//           },
//           { idempotencyKey }
//         )
//       })
//       .then((result) => res.status(200).json(result))
//       .catch((err) => {
//         console.log(err)
//         return res.status(500).send('internal server error')
//       })
//   } catch (err) {
//     console.log(err)
//   }
// })

router.post('/create-payment-intent', authenticate, async (req, res) => {
  const { details, token } = req.body

  const idempotencyKey = uuidv4()
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: details.price,
      currency: 'usd',
    })
    const clientSecret = paymentIntent.client_secret
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.log(err)

    res.status(401).send({ message: 'Internal server error' })
  }
  const payment = await new Payment({
    user_id: req.userID,
    serviceType: details.type,
    serviceName: details.serviceName,
    userName: details.name,
    email: details.email,
    mobileNo: details.mobileNo,
    price: details.price,
    status: details.status,
  }).save()
})

router.get('/payments/:userid', async (req, res) => {
  let allpayments = []
  try {
    allpayments = await Payment.find({ user_id: req.params.userid })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
    console.log(error)
    return
  }
  res.status(200).send(allpayments)
})

module.exports = router
