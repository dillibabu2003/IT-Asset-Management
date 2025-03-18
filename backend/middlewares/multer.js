const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profile-pics");
  },
  filename: function (req, file, cb) {
    const fileName = path.basename(
      req.user.id + path.extname(file.originalname),
    );
    if (!fileName) {
      cb(new Error("Failed to Upload image! User Id is required"), null);
    } else {
      cb(null, fileName);
    }
  },
});

const profilePicUpload = multer({ storage: storage });

module.exports = { profilePicUpload };
