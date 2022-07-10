const multer = require('multer')

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '--' + file.originalname)
  },
})

const upload = multer({ storage: storageEngine })

module.exports = upload
