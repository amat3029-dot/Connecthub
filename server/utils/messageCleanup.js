const Message = require("../models/Message");

const cleanupExpiredMessages = async () => {
  try {
    const now = new Date();

    // 1. Remove expired "Delete for Me" records
    await Message.updateMany(
      {
        "deletedFor.expiresAt": {
          $lte: now,
        },
      },
      {
        $pull: {
          deletedFor: {
            expiresAt: {
              $lte: now,
            },
          },
        },
      }
    );

    // 2. Permanently delete messages that were
    // deleted for everyone and whose 24 hours are over
    await Message.deleteMany({
      deletedForEveryone: true,
      deletedForEveryoneExpiresAt: {
        $lte: now,
      },
    });

    console.log("Expired deleted messages cleaned");
  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
};

module.exports = cleanupExpiredMessages;