const mongoose = require("mongoose");
const crypto = require("crypto");

const accomodationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  email: {
    type: Number,
    required: true,
  },
  room: {
    type: Number,
    required: true,
  },
  adult: {
    type: Number,
    required: true,
  },
  greatChild: {
    type: Number,
    required: true,
  },
});

// collection creation
const Accomodation = mongoose.model("ACCOMODATION", accomodationSchema);

module.exports = Accomodation;
