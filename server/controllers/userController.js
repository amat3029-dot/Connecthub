const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "connecthub-profile-pictures" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: uploadResult.secure_url },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const removeProfilePicture = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: "" },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name: name.trim() },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
  uploadProfilePicture,
      removeProfilePicture,
       updateProfile,

};