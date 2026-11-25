const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  content: {
  type: String,
  default: "",
},

    status: {
      type: String,
      default: "sent",
    },

    image: {
      type: String,
      default: "",
    },

    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        emoji: {
          type: String,
        },
      },
    ],
    deletedFor: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deletedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    recovered: {
      type: Boolean,
      default: false,
    },
  },
],

deletedForEveryone: {
  type: Boolean,
  default: false,
},

deletedForEveryoneAt: {
  type: Date,
  default: null,
},

deletedForEveryoneExpiresAt: {
  type: Date,
  default: null,
},
recoveredFor: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Message",
  messageSchema
);