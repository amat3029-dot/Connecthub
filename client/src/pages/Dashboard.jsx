import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import socket from "../socket";
import { uploadChatImage } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedChatImage, setSelectedChatImage] = useState(null);
  const [deleteMenuMessage, setDeleteMenuMessage] = useState(null);
  const chatImageInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
  const [newName, setNewName] = useState("");
  const deleteMenuRef = useRef(null);
const emojiPickerRef = useRef(null);
const attachmentMenuRef = useRef(null);
const profileMenuRef = useRef(null);
const messageMenuRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);

        socket.emit(
          "userOnline",
          response.data._id
        );

        console.log(JSON.stringify(response.data, null, 2));

        const usersResponse = await API.get("/user");

        setUsers(usersResponse.data);
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    };

    fetchProfile();
  }, [navigate]);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, []);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      deleteMenuRef.current &&
      !deleteMenuRef.current.contains(event.target)
    ) {
      setDeleteMenuMessage(null);
    }

    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowReactionPicker(null);
    }

    if (
      attachmentMenuRef.current &&
      !attachmentMenuRef.current.contains(event.target)
    ) {
      setShowAttachmentMenu(false);
    }

    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      setShowProfileMenu(false);
    }
    if (
  messageMenuRef.current &&
  !messageMenuRef.current.contains(event.target)
) {
  setSelectedMessage(null);
}
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      deleteMenuRef.current &&
      !deleteMenuRef.current.contains(event.target)
    ) {
      setDeleteMenuMessage(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useEffect(() => {
    socket.on("userTyping", (data) => {
      console.log("Received Typing:", data);

      setTypingUser(data.name);

      setTimeout(() => {
        setTypingUser("");
      }, 1000);
    });

    socket.on("receiveMessage", async (message) => {

      if (
        selectedUser &&
        message.sender._id === selectedUser._id
      ) {
        // Chat is open
        setMessages((prev) => [...prev, message]);

        await API.put(
          `/message/seen/${selectedUser._id}/${user._id}`
        );

        setUnreadCounts((prev) => ({
          ...prev,
          [selectedUser._id]: 0,
        }));

      } else {
        // Chat is not open
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender._id]:
            (prev[message.sender._id] || 0) + 1,
        }));
      }

    });
    socket.on("reactionUpdated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

  socket.on("messageRecoveredForEveryone", (recoveredMessage) => {
  console.log("Message recovered:", recoveredMessage);

  setMessages((prev) =>
    prev.map((msg) =>
      msg._id === recoveredMessage._id
        ? recoveredMessage
        : msg
    )
  );
});

    return () => {
      socket.off("userTyping");
      socket.off("receiveMessage");
      socket.off("reactionUpdated");
      socket.off("messageRecoveredForEveryone");
    };

  }, [selectedUser, user]);

useEffect(() => {
  const handleMessageDeleted = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              deletedForEveryone: true,
              content: "",
              image: "",
            }
          : msg
      )
    );
  };

  socket.on(
    "messageDeletedForEveryone",
    handleMessageDeleted
  );

  return () => {
    socket.off(
      "messageDeletedForEveryone",
      handleMessageDeleted
    );
  };
}, []);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user) return;

      try {
        const res = await API.get(
          `/message/unread/${user._id}`
        );

        const counts = {};

        res.data.forEach((item) => {
          counts[item._id] = item.count;
        });

        setUnreadCounts(counts);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUnreadCounts();
  }, [user, messages]);


  const fetchMessages = async (selected) => {
    try {
      const response = await API.get(
        `/message/${user._id}/${selected._id}`
      );

      setMessages(response.data);
      await API.put(
        `/message/seen/${selected._id}/${user._id}`
      );
      const res = await API.get(
        `/message/unread/${user._id}`
      );

      const counts = {};

      res.data.forEach((item) => {
        counts[item._id] = item.count;
      });

      setUnreadCounts(counts);
    } catch (error) {
      console.log(error);
    }
  };


  const handleSendMessage = async () => {
    try {
      if (!message.trim() && !selectedChatImage) return;
      let imageUrl = "";

      if (selectedChatImage) {
        imageUrl = await uploadChatImage(selectedChatImage);
      }
      const response = await API.post("/message", {
        sender: user._id,
        receiver: selectedUser._id,
        content: message,
        image: imageUrl,
      });

      // Show message immediately on sender screen
      setMessages((prev) => [...prev, response.data]);

      // Send message to receiver using Socket.IO
      socket.emit("sendMessage", {
        receiver: selectedUser._id,
        message: response.data,
      });

      setMessage("");
      setSelectedChatImage(null);
      setImagePreview("");

    } catch (error) {
      console.log(error);
    }
  };


  const handleDeleteMessage = async (messageId) => {
    try {
      await API.delete(`/message/${messageId}`, {
        data: {
          userId: user._id,
        },
      });

      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );

    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await API.put(
        `/message/delete-everyone/${messageId}`,
        {
          userId: user._id,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
              ...msg,
              deletedForEveryone: true,
              content: "",
              image: "",
            }
            : msg
        )
      );
  socket.emit("deleteMessageForEveryone", {
  messageId: messageId,
  receiver: selectedUser._id,
});
    } catch (error) {
      console.log(error);
    }
  };
  const handleProfileUpload = async (file) => {
    const image = file || profileImage;

    if (!image) return;

    const formData = new FormData();
    formData.append("profilePic", image);

    const token = localStorage.getItem("token");

    const response = await API.put(
      "/user/profile-picture",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUser(response.data);
    alert("Profile picture updated!");
  };


  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        "/user/remove-profile-picture",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setShowProfileMenu(false);
    } catch (error) {
      console.log(error);
    }
  };


  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        "/user/update-profile",
        {
          name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setShowEditProfile(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };


  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await API.put(
        `http://localhost:5000/api/message/${messageId}/reaction`,
        { emoji },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? res.data : msg
        )
      );

      setShowReactionPicker(null);
      setSelectedMessage(null);
    } catch (error) {
      console.error(error);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");

    alert("Logged Out Successfully");

    navigate("/");
  };


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        backgroundColor: darkMode ? "#121212" : "#f8fafc",
        overflow: "hidden",
      }}
    >

      {/* Left Side */}

      <div
        style={{
          width: "330px",
          height: "calc(100vh - 30px)",
          margin: "15px",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "white" : "black",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: "15px",
              color: darkMode ? "white" : "#333",
            }}
          >
            Users
          </h2>

          <input
            type="text"
            placeholder="🔍 Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: "25px",
              border: "1px solid #ddd",
              outline: "none",
              fontSize: "15px",
              boxSizing: "border-box",
              background: darkMode ? "#374151" : "#f5f7fb",
              color: darkMode ? "white" : "#000",
              caretColor: darkMode ? "white" : "#000",
              border: darkMode ? "1px solid #555" : "1px solid #ddd",     // Black typing cursor
            }}
          />
        </div>

        {/* User List */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {users
            .filter((u) => u._id !== user?._id)
            .filter((u) =>
              u.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((u) => (
              <div
                key={u._id}
                onClick={async () => {
                  setSelectedUser(u);

                  setUnreadCounts((prev) => ({
                    ...prev,
                    [u._id]: 0,
                  }));

                  await fetchMessages(u);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "15px",
                  cursor: "pointer",
                  transition: "0.3s",
                  background:
                    selectedUser?._id === u._id
                      ? (darkMode ? "#2563eb" : "#d9fdd3")
                      : (darkMode ? "#374151" : "#ffffff"),
                  border:
                    selectedUser?._id === u._id
                      ? "1px solid #25D366"
                      : "1px solid #eee",
                }}
              >
                {/* Avatar */}
                {u.profilePic ? (
                  <img
                    src={u.profilePic}
                    alt={u.name}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the chat
                      setSelectedImage(u.profilePic);
                      setShowImageModal(true);
                    }}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "12px",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "#2563eb",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginRight: "12px",
                    }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* User Details */}

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong>{u.name}</strong>

                    {unreadCounts[u._id] > 0 && (
                      <span
                        style={{
                          background: "#25D366",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "22px",
                          height: "22px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {unreadCounts[u._id]}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: darkMode ? "#d1d5db" : "#666",
                      marginTop: "4px",
                    }}
                  >
                    {u.email}
                  </div>

                  <small
                    style={{
                      color: onlineUsers.includes(u._id)
                        ? "green"
                        : "gray",
                    }}
                  >
                    {onlineUsers.includes(u._id)
                      ? "🟢 Online"
                      : `Last seen ${new Date(
                        u.lastSeen
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                  </small>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Side */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "white" : "black",
          margin: "15px 15px 15px 0",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              borderBottom: darkMode ? "1px solid #4b5563" : "1px solid #eee",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: darkMode ? "#60a5fa" : "#2563eb",
                }}
              >
                ConnectHub
              </h2>

              {user && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          background: "#2563eb",
                          color: "#fff",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "20px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {showProfileMenu && (
                      <div
                      ref={profileMenuRef}
                        style={{
                          position: "absolute",
                          top: "60px",
                          left: "0",
                          background: darkMode ? "#1f2937" : "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                          overflow: "hidden",
                          zIndex: 1000,
                          minWidth: "170px",
                        }}
                      >
                        {user.profilePic && (
                          <div
                            onClick={() => {
                              setSelectedImage(user.profilePic);
                              setShowImageModal(true);
                              setShowProfileMenu(false);
                            }}
                            style={{
                              padding: "12px",
                              cursor: "pointer",
                            }}
                          >
                            👁 View Photo
                          </div>
                        )}
                        <div
                          onClick={() => {
                            setNewName(user.name);
                            setShowEditProfile(true);
                            setShowProfileMenu(false);
                          }}
                          style={{
                            padding: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit Name
                        </div>
                        <div
                          onClick={() => {
                            setShowProfileMenu(false);
                            fileInputRef.current.click();
                          }}
                          style={{
                            padding: "12px",
                            cursor: "pointer",
                          }}
                        >
                          📷 Update Photo
                        </div>

                        <div
                          onClick={handleRemovePhoto}
                          style={{
                            padding: "12px",
                            cursor: "pointer",
                            color: "red",
                          }}
                        >
                          🗑 Remove Photo
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: "bold" }}>{user.name}</div>
                    <small>{user.email}</small>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setProfileImage(file);
                      handleProfileUpload(file);
                    }}
                  />
                </div>
              )}

            </div>

          </div>
          {selectedUser && (
            <h2
              style={{
                margin: 0,
                color: darkMode ? "white" : "#333",
              }}
            >
              💬 Chat with {selectedUser.name}

              <p
                style={{
                  color: "green",
                  minHeight: "20px",
                  margin: 0,
                  fontSize: "15px",
                }}
              >
                {typingUser && `${typingUser} is typing...`}
              </p>
            </h2>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
  onClick={() => navigate("/recently-deleted")}
  title="Recently Deleted"
  style={{
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  🗑️
</button>
            <button
              onClick={() => {
                const newTheme = !darkMode;
                setDarkMode(newTheme);

                localStorage.setItem(
                  "theme",
                  newTheme ? "dark" : "light"
                );
              }}
              style={{
                padding: "10px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "white" : "black",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "10px 15px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
        {selectedUser ? (
          <>
            <div
              style={{
                flex: 1,
                backgroundColor: darkMode ? "#111827" : "#ece5dd",
                borderRadius: "18px",
                border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                padding: "20px",
                overflowY: "auto",
                marginTop: "0px",
                marginBottom: "15px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.sender._id === user._id
                        ? "flex-end"
                        : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        msg.sender._id === user._id
                          ? (darkMode ? "#2563eb" : "#dbeafe")
                          : (darkMode ? "#374151" : "#f3f4f6"),

                      color: darkMode ? "white" : "black",
                      padding: "12px",
                      borderRadius: "18px",
                      maxWidth: "320px",
                      wordBreak: "break-word",
                      position: "relative",
                    }}
                  >
                    <strong>{msg.sender.name}</strong>
                    <br />

                    <div
                      onClick={() =>
                        setSelectedMessage(
                          selectedMessage === msg._id
                            ? null
                            : msg._id
                        )
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {msg.deletedForEveryone ? (
                        <div
                          style={{
                            fontStyle: "italic",
                            color: darkMode ? "#9ca3af" : "#6b7280",
                          }}
                        >
                          🗑 This message was deleted
                        </div>
                      ) : (
                        <>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Chat"
                              style={{
                                maxWidth: "220px",
                                borderRadius: "10px",
                                marginBottom: msg.content ? "8px" : "0",
                                display: "block",
                              }}
                            />
                          )}
                           {msg.content && <div>{msg.content}</div>}
                        </>
                      )}
                     
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0px",
                            right: "12px",
                            background: "white",
                            borderRadius: "20px",
                            padding: "2px 8px",
                            border: "1px solid #ddd",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                            fontSize: "16px",
                            display: "flex",
                            gap: "2px",
                          }}
                        >
                          <div
                            onDoubleClick={() => {
                              console.log("Double Click Fired");
                              handleReaction(msg._id, msg.reactions[0].emoji);
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            {msg.reactions.map((reaction) => (
                              <span key={reaction._id}>
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedMessage === msg._id && (
                      <div
                       ref={messageMenuRef}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: "5px",
                          display: "flex",
                          gap: "10px",
                          fontSize: "12px",
                        }}
                      >
                        <span
                          onClick={() =>
                            navigator.clipboard.writeText(msg.content)
                          }
                          style={{
                            cursor: "pointer",
                            color: "#2563eb",
                          }}
                        >
                          📋 Copy
                        </span>

                        <span
                          onClick={() =>
                            setDeleteMenuMessage(
                              deleteMenuMessage === msg._id
                                ? null
                                : msg._id
                            )
                          }
                          style={{
                            cursor: "pointer",
                            color: "red",
                          }}
                        >
                          🗑 Delete
                        </span>
                        {deleteMenuMessage === msg._id && (
                          <div
                            ref={deleteMenuRef}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "0",
                              background: darkMode ? "#1f2937" : "#fff",
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                              zIndex: 1000,
                              minWidth: "180px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              onClick={() => {
                                handleDeleteMessage(msg._id);
                                setDeleteMenuMessage(null);
                              }}
                              style={{
                                padding: "12px",
                                cursor: "pointer",
                              }}
                            >
                              🗑 Delete for me
                            </div>

                            {msg.sender._id === user._id && (
                              <div
                                onClick={() => {
                                  handleDeleteForEveryone(msg._id);
                                  setDeleteMenuMessage(null);
                                }}
                                style={{
                                  padding: "12px",
                                  cursor: "pointer",
                                  borderTop: "1px solid #ddd",
                                }}
                              >
                                🌍 Delete for everyone
                              </div>
                            )}
                          </div>
                        )}
                        <span
                          onClick={() =>
                            setShowReactionPicker(
                              showReactionPicker === msg._id
                                ? null
                                : msg._id
                            )
                          }
                          style={{
                            cursor: "pointer",
                            color: "#16a34a",
                          }}
                        >
                          😀 Emoji
                        </span>

                        {showReactionPicker === msg._id && (
                          <div
                            ref={emojiPickerRef}
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "8px",
                              width: "100%",
                              fontSize: "18px",
                            }}
                          >
                            {reactions.map((emoji) => (
                              <span
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReaction(msg._id, emoji);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <br />

                    <small>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" "}
                      {msg.status === "sent" ? "✓" : "✓✓"}
                    </small>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef}></div>
            </div>

            {imagePreview && (
              <div
                style={{
                  marginBottom: "10px",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "180px",
                    borderRadius: "10px",
                  }}
                />

                <button
                  onClick={() => {
                    setSelectedChatImage(null);
                    setImagePreview("");
                  }}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: "red",
                    color: "white",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", alignItems: "center", }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}

                onChange={(e) => {
                  setMessage(e.target.value);

                  socket.emit("typing", {
                    name: user.name,
                  });
                }}

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}

                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: darkMode ? "1px solid #555" : "1px solid #ddd",
                  backgroundColor: darkMode ? "#374151" : "white",
                  color: darkMode ? "white" : "black",
                }}
              />
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  ➕
                </button>
                {showAttachmentMenu && (
                  <div
                   ref={attachmentMenuRef}
                    style={{
                      position: "absolute",
                      bottom: "55px",
                      right: 0,
                      background: darkMode ? "#1f2937" : "#ffffff",
                      border: darkMode ? "1px solid #4b5563" : "1px solid #ddd",
                      borderRadius: "12px",
                      boxShadow: darkMode
                        ? "0 4px 12px rgba(0,0,0,0.5)"
                        : "0 4px 12px rgba(0,0,0,0.2)",
                      minWidth: "180px",
                      zIndex: 1000,

                    }}
                  >
                    <div
                      onClick={() => chatImageInputRef.current.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 15px",
                        cursor: "pointer",
                        color: darkMode ? "white" : "black",
                        background: darkMode ? "#1f2937" : "#ffffff",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          width: "24px",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        🖼️
                      </span>

                      <span>Photo</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 15px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                        background: darkMode ? "#1f2937" : "#ffffff",
                      }}
                    >
                      <span style={{ display: "inline-flex", width: "24px", justifyContent: "center" }}>📄</span>
                      <span>Document</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 15px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                        background: darkMode ? "#1f2937" : "#ffffff",
                      }}
                    >
                      <span style={{ display: "inline-flex", width: "24px", justifyContent: "center" }}>🎥</span>
                      <span>Video</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                style={{
                  padding: "12px 20px",
                  backgroundColor: darkMode ? "#3b82f6" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
            {showImageModal && (
              <div
                onClick={() => setShowImageModal(false)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.8)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2000,
                }}
              >
                <img
                  src={selectedImage}
                  alt="Profile"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: "80%",
                    maxHeight: "80%",
                    borderRadius: "12px",
                  }}
                />

                <button
                  onClick={() => setShowImageModal(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: "red",
                    color: "#fff",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ✕
                </button>
              </div>

            )}
            {showEditProfile && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2000,
                }}
              >
                <div
                  style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    width: "350px",
                  }}
                >
                  <h3>Edit Profile Name</h3>

                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "10px",
                      marginBottom: "20px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => setShowEditProfile(false)}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleUpdateProfile}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
            <input
              ref={chatImageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                setSelectedChatImage(file);
                setImagePreview(URL.createObjectURL(file));
                setShowAttachmentMenu(false);
              }}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
              color: darkMode ? "#d1d5db" : "#666",
            }}
          >
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;