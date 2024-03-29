const { response } = require("express");
const express = require("express");
const router = express.Router();
require("dotenv").config();
require("../db/conn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../model/userSchema");
const Caruser = require("../model/carUserSchema");
const authenticate = require("../middleware/authenticate");
const sendEmail = require("../utils/sendEmail");
const REACTAPP_URL = process.env.REACTAPP_URL;
// const cookieParser = require("cookie-parser");
// router.use(cookieParser) ;

//using async await
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res.status(422).json({ error: "Some data fields are missing" });
  }
  // console.log("working 1");
  try {
    const userEmailExists = await User.findOne({ email: email });
    // const userphoneExists = await User.findOne({ phone: phone });

    if (userEmailExists) {
      return res
        .status(422)
        .json({ error: "User with this email already exists" });
    }
    // console.log("workinng 2");
    if (password != confirmPassword) {
      return res
        .status(422)
        .json({ error: "Password is not matching with the Confirm Password" });
    } else {
      const user = new User({
        username,
        email,
        password,
      });
      await user.save();

      const userId = await User.findOne({ _id: user._id });
      let token;
      if (userId) {
        token = await userId.generateAuthToken();
      } else {
        return res
          .status(422)
          .json({ error: "User Registration Failed. Retry registering again" });
      }
      // console.log(token);
      const verifyUrl = `${REACTAPP_URL}/user/${user._id}/verify/${token}`;
      const message = `
        <h1>Email verification </h1>
        <h2>Hello ${user.username} </h2>
        <p>Please verify your email to continue</p>
        <a href = ${verifyUrl} clicktracking-off> ${verifyUrl}</a>
      `;
      try {
        await sendEmail({
          to: user.email,
          subject: "Email verification",
          text: message,
        });

        res.status(200).json({
          success: true,
          data: "User Registerd and Email verification sent.",
        });
      } catch (error) {
        // user.verified = false;
        // await user.save();
        return res.status(400).json({ error: "Unable to send Email" });
      }
      //res.status(201).json({ message: "User Registered Successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
});

//login route
router.post("/signin", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Empty Credentials!" });
    }
    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);

      token = await userLogin.generateAuthToken();
      // console.log(token);
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });
      // console.log(userLogin.name);
      if (passMatch) {
        const { _id, name, email } = userLogin;
        res.status(201).json({
          token,
          user: { _id, email, name },
        });
      } else return res.status(400).json({ error: "Invaid Credentials!" });
    } else return res.status(400).json({ error: "Invaid Credentials!" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(err);
  }
});

//forgot password route
router.post("/forgotpassword", async (req, res) => {
  // res.send("Forgot password Route");
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: " Email don't exist" });
    }
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);

    await user.save();

    const resetUrl = `${REACTAPP_URL}/user/resetpassword/${resetToken}`;
    // console.log(resetUrl);
    const message = `
      <h1>You have requested a password reset </h1>
      <p>Please go  to thislink to reset password</p>
      <a href = ${resetUrl} clicktracking-off> ${resetUrl}</a>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Password reset request",
        text: message,
      });

      res.status(200).json({
        success: true,
        data: "Password Reset Sent to Email ",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(400).json({ error: "Unable to send Email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
});

router.put("/resetpassword/:resetToken", async (req, res) => {
  // res.send("Reset Password Route");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid Token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(201).json({
      success: true,
      data: "Password reset success",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
});

router.get("/:userid/verify/:token", async (req, res) => {
  // console.log(req.rootUser);
  // res.status(200).json(req.rootUser);
  try {
    const user = await User.findOne({
      _id: req.params.userid,
      "tokens.token": req.params.token,
      verified: false,
    });
    console.log(user);
    if (!user) return res.status(400).send({ message: "Invalid link" });
    else {
      await User.updateOne({ verified: true });
      res.status(200).send({ message: "Email verified successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await User.find({ status: { $ne: "Blocked" } });
    // console.log(user);
    if (!user)
      return res.status(400).send({ message: "No user has registered yet !!" });
    else {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/:userid/update", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userid });
    console.log(req.body);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User Details !!" });
    } else {
      await User.updateOne(
        { _id: req.params.userid },
        req.body
        // function (err, docs) {
        //   if (err) {
        //     console.log(err);
        //     return res.status(500).json({
        //       success: false,
        //       message: "Something Went Wrong !!",
        //     });
        //   } else {
        //     console.log("Updated Details : ", docs);
        //     return res.status(201).json({
        //       success: true,
        //       message: "User Details Has Been Updated !!",
        //     });
        //   }
        // }
      );
      return res.status(201).json({
        success: true,
        message: "User Details Has Been Updated !!",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
