const express = require("express");
const { response } = require("express");
const router = express.Router();
require("../db/conn");
const authenticate = require("../middleware/authenticate");
const imageToBase64 = require("image-to-base64");
const User = require("../model/userSchema");
const Blog = require("../model/blogSchema");
const multer = require("multer");
const fs = require("fs");

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const upload = multer({ storage: storageEngine });

router.post(
  "/blogpost",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    const { title, description, file } = req.body;
    const type = req.body.type;
    try {
      if (type === "self") {
        // self written blog
        if (!title || !description) {
          return res
            .status(422)
            .json({ error: "Some data fields are missing" });
        }
        const base64FormattedImage = await imageToBase64(req.file.path);
        const blog = await new Blog({
          isSelf: true,
          user_id: req.userID,
          title: title,
          description: description,
          image: base64FormattedImage,
        }).save();
      } else if (type === "html") {
        // HTML file upload
        if (!title) {
          return res.status(422).json({ error: "title is missing" });
        }
        const data = fs.readFileSync(req.file.path, "utf8");
        const blog = await new Blog({
          isSelf: false,
          user_id: req.userID,
          title: title,
          html: data,
        }).save();
      }
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
      console.log(error);
    }

    res.status(200).json({ message: "Succefully posted the blog" });
  }
);

module.exports = router;
