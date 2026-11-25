require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const User = require("./models/User");
const cleanupExpiredMessages = require("./utils/messageCleanup");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);
const onlineUsers = new Map();

connectDB();

// Check every 1 minute
setInterval(
  cleanupExpiredMessages,
  60 * 1000
);

cleanupExpiredMessages();

// Run once when server starts
cleanupExpiredMessages();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("ConnectHub API Running");
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.keys())
    );
  });
  socket.on("typing", (data) => {
    console.log("Typing Event:", data);

    socket.broadcast.emit("userTyping", data);
  });
  socket.on("sendMessage", (data) => {

    const receiverSocketId = onlineUsers.get(data.receiver);

    if (receiverSocketId) {

      io.to(receiverSocketId).emit(
        "receiveMessage",
        data.message
      );

    }

  });
  socket.on("deleteMessageForEveryone", (data) => {
  const receiverSocketId = onlineUsers.get(data.receiver);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit(
      "messageDeletedForEveryone",
      data.messageId
    );
  }
});
  socket.on("disconnect", async () => {
    let disconnectedUserId = null;

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;

        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(
        "Updating Last Seen:",
        disconnectedUserId
      );

      await User.findByIdAndUpdate(
        disconnectedUserId,
        {
          lastSeen: new Date(),
        }
      );

      console.log("Last Seen Updated");
    }

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.keys())
    );

    console.log(
      "User Disconnected:",
      socket.id
    );
  });
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});