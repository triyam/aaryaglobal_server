const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    // port: 993,
    // host: 'smtp.ethereal.email',
    // port: 587,
    service: "gmail",
    auth: {
      user: "email.devtest02@gmail.com",
      pass: "Testemail123",
    },
  });

  const mailOptions = {
    from: "email.devtest02@gmail.com",
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
