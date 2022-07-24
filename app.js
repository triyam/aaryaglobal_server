const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const cors = require('cors')
const Router = express.Router()

const app = express()
<<<<<<< HEAD
// var corsOptions = {
//   origin: 'http://localhost:3000',
//   optionsSuccessStatus: 200, // For legacy browser support
//   // methods: "GET, PUT"
// }

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://arya-global-new.vercel.app'],
    credentials: true,
  })
)
// const whitelist = ['http://localhost:3000']
// app.options('*', cors())
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(null, false)
//       }
//     },
//   })
// )
=======

app.use(cors())
>>>>>>> poornesh

app.use(express.json({ limit: '30mb' }))
dotenv.config()

require('./db/conn')
// const User = require('./model/userSchema');
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World from the Server')
})

app.use('/user', require('./router/auth'))
app.use('/hotel', require('./router/hotelAuth'))
app.use('/car', require('./router/carAuth'))
app.use('/golf', require('./router/golfAuth'))
app.use(require('./router/blogs.js'))
app.use(require('./router/userDetails.js'))
app.use(require('./router/siteReview'))
app.use(require('./router/banner'))
app.use(require('./router/payment'))

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`)
})
