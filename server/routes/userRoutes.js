const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const upload = require("../middleware/upload");
const {
    uploadProfilePicture,
    removeProfilePicture,
    updateProfile,
} = require("../controllers/userController");

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.put(
    "/profile-picture",
    protect,
    upload.single("profilePic"),
    uploadProfilePicture
);
router.put(
    "/remove-profile-picture",
    protect,
    removeProfilePicture
);
router.put(
    "/update-profile",
    protect,
    updateProfile
);

module.exports = router;