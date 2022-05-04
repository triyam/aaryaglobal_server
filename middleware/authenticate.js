const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
var express = require("express");
var cookieParser = require("cookie-parser");
var app = express();
app.use(cookieParser());

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.json({ error: "You must be logged in!" });
    }
    const token = authorization.replace("Bearer ", "");
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootUser) throw new Error("User not Found!");

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
  } catch (error) {
    res.status(401).send("Unauthorized: No token provided");
    console.log(error);
  }
};
module.exports = authenticate;
