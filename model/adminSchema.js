const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
        required: true,
    },
    service: {
        type: String,
        default: "owner",
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

adminUserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        // this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12);
    }
    next();
});
//generating user token
adminUserSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
};

// collection creation
const AdminUser = mongoose.model("ADMIN", adminUserSchema);

module.exports = AdminUser;
