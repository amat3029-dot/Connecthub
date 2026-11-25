const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  markMessagesSeen,
  getUnreadCounts,
  deleteMessage,
    deleteForEveryone,
  reactToMessage,
  uploadImage,
  getRecentlyDeleted,
  recoverMessage,
  recoverForEveryone,
  recoverForMe,
} = require("../controllers/messageController");

// Upload image
router.post(
  "/upload-image",
  upload.single("image"),
  uploadImage
);


// Recently Deleted
router.get(
  "/recently-deleted",
  protect,
  getRecentlyDeleted
);


// Unread counts
router.get(
  "/unread/:userId",
  getUnreadCounts
);


// Send message
router.post(
  "/",
  sendMessage
);
// Get messages
router.get(
  "/:senderId/:receiverId",
  getMessages
);


// Mark messages seen
router.put(
  "/seen/:senderId/:receiverId",
  markMessagesSeen
);


// Reaction
router.put(
  "/:id/reaction",
  protect,
  reactToMessage
);


// Delete for everyone
router.put(
  "/delete-everyone/:messageId",
  deleteForEveryone
);

// Delete for me
router.delete(
  "/:messageId",
  deleteMessage
);
router.put(
  "/recover/:messageId",
  protect,
  recoverMessage
);
router.put(
  "/recover-everyone/:messageId",
  protect,
  recoverForEveryone
);
router.put(
  "/recover-for-me/:messageId",
  protect,
  recoverForMe
);
module.exports = router;