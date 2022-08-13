const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const tokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,

    },
    createdAt: {
        type: Date,
        required: true,

    },
    expiredAt: {
        type: Date,
        required: true,

    }
});



// collection creation
const Token = mongoose.model("TOKEN", tokenSchema);

module.exports = Token;
