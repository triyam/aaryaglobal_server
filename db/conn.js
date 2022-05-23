const mongoose = require('mongoose')
require('dotenv').config()

const DB = process.env.DATABASE
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('DB connection successful')
  })
  .catch((err) => {
    console.log(err)
  })
