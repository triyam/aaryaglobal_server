const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const cors = require('cors')
const Router = express.Router()

const app = express()

app.use(cors())

app.use(express.json({ limit: '30mb' }))
dotenv.config()

require('./db/conn')
// const User = require('./model/userSchema');
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World from the Server')
})

app.use('/user', require('./router/auth'))
app.use('/service', require('./router/serviceAuth'))

app.use(require('./router/blogs.js'))
app.use(require('./router/userDetails.js'))
app.use(require('./router/siteReview'))
app.use(require('./router/banner'))
app.use(require('./router/payment'))

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`)
})
