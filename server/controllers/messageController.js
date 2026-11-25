const mongoose = require("mongoose");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");


const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content, image } = req.body;

    const message = await Message.create({
      sender,
      receiver,
      content,
      image,
    });

    const savedMessage = await Message.findById(message._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $and: [
        {
          $or: [
            {
              sender: senderId,
              receiver: receiverId,
            },
            {
              sender: receiverId,
              receiver: senderId,
            },
          ],
        },

        {
          deletedFor: {
            $not: {
              $elemMatch: {
                user: senderId,
                recovered: false,
              },
            },
          },
        },

        {
          deletedForEveryone: false,
        },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const markMessagesSeen = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        status: "sent",
      },
      {
        status: "seen",
      }
    );

    res.json({
      message: "Messages marked as seen",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const recoverForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Message must be deleted for everyone
    if (!message.deletedForEveryone) {
      return res.status(400).json({
        message: "Message is not deleted for everyone",
      });
    }

    // Check if this user already recovered it
    const alreadyRecovered = message.recoveredFor.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyRecovered) {
      return res.status(400).json({
        message: "Message is already recovered for you",
      });
    }

    // Add current user to recoveredFor
    message.recoveredFor.push(userId);

    await message.save();

    res.json({
      message: "Message recovered for you",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const unread = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          status: "sent",
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("Unread:", unread);

    res.json(unread);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Check whether this user already deleted the message
    const alreadyDeleted = message.deletedFor.some(
      (item) => item.user.toString() === userId
    );

    if (alreadyDeleted) {
      return res.json({
        message: "Message is already in Recently Deleted",
      });
    }

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    message.deletedFor.push({
      user: userId,
      deletedAt: now,
      expiresAt: expiresAt,
      recovered: false,
    });

    await message.save();

    res.json({
      message: "Message moved to Recently Deleted",
      deletedAt: now,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const getRecentlyDeleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const messages = await Message.find({
      $or: [
        // =========================
        // DELETE FOR ME
        // =========================
        {
          deletedFor: {
            $elemMatch: {
              user: userId,
              recovered: false,
              expiresAt: {
                $gt: now,
              },
            },
          },
        },

        // =========================
        // DELETE FOR EVERYONE
        // =========================
        {
          deletedForEveryone: true,
          deletedForEveryoneExpiresAt: {
            $gt: now,
          },
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ updatedAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(
      "Recently Deleted Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
const recoverMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Find this user's deleted record
    const deletedRecord = message.deletedFor.find(
      (item) =>
        item.user.toString() === userId &&
        item.recovered === false
    );

    if (!deletedRecord) {
      return res.status(404).json({
        message: "Deleted message not found",
      });
    }

    // Recover only for this user
    deletedRecord.recovered = true;

    await message.save();

    res.json({
      message: "Message recovered successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        message: "Only sender can delete for everyone",
      });
    }

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    message.deletedForEveryone = true;
    message.deletedForEveryoneAt = now;
    message.deletedForEveryoneExpiresAt = expiresAt;

    await message.save();

    res.json({
      message: "Message moved to Recently Deleted for everyone",
      deletedAt: now,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const recoverForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;

    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can recover for everyone
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        message: "Only sender can recover message for everyone",
      });
    }

    // Check whether message was actually deleted for everyone
    if (!message.deletedForEveryone) {
      return res.status(400).json({
        message: "Message is not deleted for everyone",
      });
    }

    // Recover for everyone
    message.deletedForEveryone = false;
    message.deletedForEveryoneAt = null;
    message.deletedForEveryoneExpiresAt = null;

   await message.save();

const io = req.app.get("io");

const recoveredMessage = await Message.findById(message._id)
  .populate("sender", "name")
  .populate("receiver", "name");

io.emit("messageRecoveredForEveryone", recoveredMessage);

res.json({
  message: "Message recovered for everyone",
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const reactToMessage = async (req, res) => {
  try {
    console.log("Reaction API Hit");
    console.log("Message ID:", req.params.id);
    console.log("User:", req.user);
    console.log("Emoji:", req.body.emoji);

    const { emoji } = req.body;

    const message = await Message.findById(req.params.id);



    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const index = message.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user.id
    );

    if (index !== -1) {
      if (message.reactions[index].emoji === emoji) {
        // Remove reaction
        message.reactions.splice(index, 1);
      } else {
        // Change reaction
        message.reactions[index].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.user.id,
        emoji,
      });
    }

    await message.save();

    await message.populate("sender", "name");
    await message.populate("receiver", "name");
    const io = req.app.get("io");

    io.emit("reactionUpdated", message);

    res.json(message);

    res.json(message);
  } catch (error) {
    console.log("Reaction Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "connecthub-chat-images",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier
        .createReadStream(req.file.buffer)
        .pipe(stream);
    });

    res.json({
      imageUrl: uploadResult.secure_url,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
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
};