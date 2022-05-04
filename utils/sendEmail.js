const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./.env" });

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    // port: 993,
    // host: 'smtp.ethereal.email',
    // port: 587,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
