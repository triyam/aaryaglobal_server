const { response } = require("express");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const bcrypt = require("bcrypt");
require("../db/conn");
const AdminUser = require("../model/adminSchema");
const REACTAPP_URL = process.env.REACTAPP_URL;

router.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword, service } = req.body;
    if (!username || !email || !password || !confirmPassword || !service) {
        return res.status(422).json({ error: "Some data fields are missing" });
    }
    // console.log("working 1");
    try {
        const userEmailExists = await AdminUser.findOne({ email: email });

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
            const user = new AdminUser({
                username,
                email,
                password,
            });
            await user.save();
            res.status(201).json({ message: "Admin Created Successfully" });
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
        const { email, password, service } = req.body;
        if (!email || !password || !service) {
            return res.status(400).json({ error: "Empty Credentials!" });
        }
        const userLogin = await AdminUser.findOne({ email: email, service: service });

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
                const { _id, username, email, service } = userLogin;
                res.status(201).json({
                    token,
                    serviceUser: { _id, email, username, service },
                });
            } else return res.status(400).json({ error: "Invaid Credentials!" });
        } else return res.status(400).json({ error: "Invaid Credentials!" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log(err);
    }
});

module.exports = router;
