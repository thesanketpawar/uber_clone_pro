const multer = require("multer");

const storageUserImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const storageCaptainImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/captain/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileImageFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype == "image/svg+xml" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/webp"
  ) {
    return cb(null, true);
  } else {
    req.fileValidationError = "Please upload valid file type";
    return cb(null, false);
  }
};

const uploadUserImage = multer({
  storage: storageUserImage,
  fileFilter: fileImageFilter,
}).any();

const uploadCaptainImage = multer({
  storage: storageCaptainImage,
  fileFilter: fileImageFilter,
}).any();

module.exports = {
  uploadUserImage,
  uploadCaptainImage
};
