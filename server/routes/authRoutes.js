const express = require("express");
const router = express.Router();

const {
      registerUser,
      loginUser,
      checkEmail,
      resetPassword,

} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-email", checkEmail);
router.put("/reset-password", resetPassword);

module.exports = router;