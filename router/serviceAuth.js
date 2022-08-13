const { response } = require("express");
const express = require("express");
const router = express.Router();
require("../db/conn");
require('dotenv').config()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Serviceuser = require("../model/serviceUserSchema");
const Token = require("../model/tokenSchema");
const authenticate = require("../middleware/authenticate");
const sendEmail = require("../utils/sendEmail");
const REACTAPP_URL = process.env.REACTAPP_URL
//using async await
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword, service } = req.body;
  if (!username || !email || !password || !confirmPassword || !service) {
    return res.status(422).json({ error: "Some data fields are missing" });
  }
  // console.log("working 1");
  try {
    const userEmailExists = await Serviceuser.findOne({ email: email });
    // const userphoneExists = await User.findOne({ phone: phone });

    if (userEmailExists) {
      return res
        .status(422)
        .json({ message: "User with this email already exists", success: false });
    }
    // console.log("workinng 2");
    if (password != confirmPassword) {
      return res
        .status(422)
        .json({ message: "Password is not matching with the Confirm Password", success: false });
    } else {
      const user = new Serviceuser({
        username,
        email,
        password,
      });
      await user.save();

      const userId = await Serviceuser.findOne({ _id: user._id });
      let token;
      if (userId) {
        token = await userId.generateAuthToken();
      } else {
        return res
          .status(422)
          .json({ message: "User Registration Failed. Retry registering again", success: false });
      }
      // console.log(token);
      const verifyUrl = `${REACTAPP_URL}/hotel/${user._id}/verify/${token}`;
      const message = `
        <h1>Email verificatoin </h1>
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
          message: "Email verification Sent ",
          success: true,
        });
      } catch (error) {
        // user.verified = false;
        // await user.save();
        return res.status(400).json({ message: "Unable to send Email", success: false });
      }
      res.status(201).json({ message: "User Registered Successfully", success: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(error);
  }
});

//login route
router.post("/signin", async (req, res) => {
  try {
    // let token;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Empty Credentials!", success: false });
    }
    const userLogin = await Serviceuser.findOne({ email: email });

    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);

      // token = await userLogin.generateAuthToken();
      // res.cookie("jwtoken", token, {
      //   expires: new Date(Date.now() + 25892000000),
      //   httpOnly: true,
      // });
      if (passMatch) {
        const { _id, username, email, service } = userLogin;

        const refreshToken = jwt.sign({
          id: _id
        }, "refresh_secret", { expiresIn: '1w' });

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        const expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 7);

        const newToken = new Token({
          userId: _id,
          token: refreshToken,
          createdAt: new Date(),
          expiredAt: expired_at
        });
        await newToken.save();

        const token = jwt.sign({
          id: _id
        }, "access_secret", { expiresIn: '300s' });

        res.status(201).json({
          token,
          serviceUser: { _id, email, username, service },
          message: "login Successful", success: true
        });
      } else return res.status(400).json({ message: "Invaid Credentials!", success: false });
    } else return res.status(400).json({ message: "Invaid Credentials!", success: false });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", success: false });
    console.log(err);
  }
});

//forgot password route
router.post("/forgotpassword", async (req, res) => {
  // res.send("Forgot password Route");
  const { email } = req.body;

  try {
    const user = await Serviceuser.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: " Email don't exist" });
    }
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);

    await user.save();

    const resetUrl = `${REACTAPP_URL}/hotel/resetpassword/${resetToken}`;
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
        message: "Password Reset Sent to Email ",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(400).json({ message: "Unable to send Email", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
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
    const user = await Serviceuser.findOne({
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

//email verification
router.get("/:userid/verify/:token", async (req, res) => {
  // console.log(req.rootUser);
  // res.status(200).json(req.rootUser);
  try {
    const user = await Serviceuser.findOne({
      _id: req.params.userid,
      "tokens.token": req.params.token,
      verified: false,
    });
    console.log(user);
    if (!user) return res.status(400).send({ message: "Invalid link" });
    else {
      await Serviceuser.updateOne({ verified: true });
      res.status(200).send({ message: "Email verified successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});


//refresh 
router.get("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies['refreshToken'];

    const payload = jwt.verify(refreshToken, "refresh_secret");

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const dbToken = await Serviceuser.findOne({
      _id: payload.id,
      expireAt: { $gt: ISODate(new Date().toString()) }
    });

    if (!dbToken) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const token = jwt.sign({
      _id: payload.id
    }, "access_secret", { expiresIn: '30s' });

    res.send({
      token
    })
  } catch (e) {
    return res.status(401).send({
      message: 'unauthenticated'
    });
  }
}
);

router.get("/logout", async (req, res) => {
  const refreshToken = req.cookies['refreshToken'];

  await Serviceuser.delete({ token: refreshToken });

  res.cookie('refreshToken', '', { maxAge: 0 });

  res.send({
    message: 'success'
  });
}
);

router.get("/authenticated", async (req, res) => {
  try {
    const accessToken = req.header('Authorization')?.split(" ")[1] || "";

    const payload = jwt.verify(accessToken, "access_secret");

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const user = await Serviceuser.findOne(payload.id);

    if (!user) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const { password, ...data } = user;

    res.send(data);
  } catch (e) {
    return res.status(401).send({
      message: 'unauthenticated'
    });
  }
}
);

module.exports = router;
