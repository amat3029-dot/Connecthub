import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentlyDeleted = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // =========================
  // THEME
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // =========================
  // FETCH RECENTLY DELETED
  // =========================

  const fetchRecentlyDeleted = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/message/recently-deleted",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch messages"
        );
      }

      setMessages(data);
    } catch (error) {
      console.error(
        "Recently Deleted Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentlyDeleted();
  }, []);

  // =========================
  // GET CURRENT USER ID
  // =========================

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.id;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  // =========================
  // GET DELETE-FOR-ME RECORD
  // =========================

  const getMyDeletedRecord = (message) => {
    const userId = getCurrentUserId();

    if (!userId || !message.deletedFor) {
      return null;
    }

    return message.deletedFor.find(
      (item) =>
        item.user?.toString() ===
          userId.toString() &&
        item.recovered === false
    );
  };

  // =========================
  // REMAINING TIME
  // =========================

  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) {
      return "No expiry time";
    }

    const difference =
      new Date(expiresAt) - new Date();

    if (difference <= 0) {
      return "Expired";
    }

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes}m remaining`;
  };

  // =========================
  // RECOVER DELETE-FOR-ME
  // =========================

  const handleRecoverForMe = async (messageId) => {
    try {
      setRecoveringId(messageId);

      const response = await fetch(
        `http://localhost:5000/api/message/recover/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to recover message"
        );
      }

      // Remove from Recently Deleted
      setMessages((prev) =>
        prev.filter(
          (message) =>
            message._id !== messageId
        )
      );
    } catch (error) {
      console.error(
        "Recover error:",
        error
      );

      alert(error.message);
    } finally {
      setRecoveringId(null);
    }
  };

  // =========================
  // RECOVER DELETE-FOR-EVERYONE
  // FOR CURRENT USER ONLY
  // =========================

  const handleRecoverDeletedForMe = async (
    messageId
  ) => {
    try {
      setRecoveringId(messageId);

      const response = await fetch(
        `http://localhost:5000/api/message/recover-for-me/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to recover message for you"
        );
      }

      // Remove from Recently Deleted
      setMessages((prev) =>
        prev.filter(
          (message) =>
            message._id !== messageId
        )
      );
    } catch (error) {
      console.error(
        "Recover for me error:",
        error
      );

      alert(error.message);
    } finally {
      setRecoveringId(null);
    }
  };

  // =========================
  // RECOVER FOR EVERYONE
  // =========================

  const handleRecoverForEveryone = async (
    messageId
  ) => {
    const confirmed = window.confirm(
      "Recover this message for everyone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRecoveringId(messageId);

      const response = await fetch(
        `http://localhost:5000/api/message/recover-everyone/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to recover message for everyone"
        );
      }

      // Remove from Recently Deleted
      setMessages((prev) =>
        prev.filter(
          (message) =>
            message._id !== messageId
        )
      );
    } catch (error) {
      console.error(
        "Recover for everyone error:",
        error
      );

      alert(error.message);
    } finally {
      setRecoveringId(null);
    }
  };

  // =========================
  // THEME COLORS
  // =========================

  const theme = darkMode
    ? {
        background: "#121212",
        card: "#1e1e1e",
        text: "#ffffff",
        secondaryText: "#aaaaaa",
        border: "#333333",
        button: "#2a2a2a",
        expiry: "#ffb74d",
      }
    : {
        background: "#ffffff",
        card: "#fafafa",
        text: "#222222",
        secondaryText: "#777777",
        border: "#dddddd",
        button: "#ffffff",
        expiry: "#d97706",
      };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: theme.background,
          color: theme.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Recently Deleted...
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        overflow: "hidden",
        background: theme.background,
        color: theme.text,
        transition: "0.2s",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* HEADER LEFT */}

        <div
          style={{
            textAlign: "left",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              color: theme.text,
            }}
          >
            Recently Deleted
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "13px",
              color: theme.secondaryText,
            }}
          >
            Messages are permanently removed
            after 24 hours.
          </p>
        </div>

        {/* HEADER BUTTONS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* DASHBOARD */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            title="Back to Dashboard"
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.button,
              color: theme.text,
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ← Dashboard
          </button>

          {/* DARK / LIGHT */}

          <button
            onClick={() =>
              setDarkMode((prev) => !prev)
            }
            title={
              darkMode
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
            style={{
              width: "38px",
              height: "38px",
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              background: theme.button,
              color: theme.text,
              cursor: "pointer",
              fontSize: "17px",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* REFRESH */}

          <button
            onClick={fetchRecentlyDeleted}
            title="Refresh"
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.button,
              color: theme.text,
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ================= MESSAGE AREA ================= */}

      <div
        style={{
          flex: 1,
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "5px",
          boxSizing: "border-box",
          textAlign: "left",
        }}
      >
        {/* ================= EMPTY ================= */}

        {messages.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              color: theme.secondaryText,
              paddingLeft: "10px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "10px",
              }}
            >
              🗑️
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              No recently deleted messages
            </div>

            <div
              style={{
                fontSize: "13px",
                marginTop: "5px",
              }}
            >
              Deleted messages will appear
              here.
            </div>
          </div>
        ) : (
          /* ================= MESSAGE LIST ================= */

          messages.map((message) => {
            const myDeletedRecord =
              getMyDeletedRecord(message);

            const expiresAt =
              message.deletedForEveryone
                ? message.deletedForEveryoneExpiresAt
                : myDeletedRecord?.expiresAt;

            const isRecovering =
              recoveringId === message._id;

            const currentUserId =
              getCurrentUserId();

            const senderId =
              message.sender?._id ||
              message.sender;

            const isSender =
              currentUserId &&
              senderId?.toString() ===
                currentUserId.toString();

            return (
              <div
                key={message._id}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  marginBottom: "10px",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "10px",
                  background: theme.card,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  textAlign: "left",
                }}
              >
                {/* ================= LEFT INFO ================= */}

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "left",
                  }}
                >
                  {/* USERS */}

                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.secondaryText,
                      marginBottom: "6px",
                      textAlign: "left",
                    }}
                  >
                    {message.sender?.name ||
                      "Unknown"}{" "}
                    →{" "}
                    {message.receiver?.name ||
                      "Unknown"}
                  </div>

                  {/* MESSAGE */}

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "500",
                      wordBreak: "break-word",
                      textAlign: "left",
                      color: theme.text,
                    }}
                  >
                    {message.content
                      ? message.content
                      : message.image
                      ? "🖼️ Image / File"
                      : "Empty message"}
                  </div>

                  {/* STATUS */}

                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.secondaryText,
                      marginTop: "7px",
                      textAlign: "left",
                    }}
                  >
                    {message.deletedForEveryone
                      ? "Deleted for everyone"
                      : "Deleted for you"}
                  </div>

                  {/* EXPIRY */}

                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.expiry,
                      marginTop: "3px",
                      textAlign: "left",
                    }}
                  >
                    ⏳{" "}
                    {getRemainingTime(
                      expiresAt
                    )}
                  </div>
                </div>

                {/* ================= RIGHT BUTTONS ================= */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "7px",
                    flexShrink: 0,
                  }}
                >
                  {/* =========================================
                      DELETE FOR EVERYONE
                      SENDER GETS TWO OPTIONS
                     ========================================= */}

                  {message.deletedForEveryone &&
                    isSender && (
                      <>
                        {/* RECOVER FOR ME */}

                        <button
                          onClick={() =>
                            handleRecoverDeletedForMe(
                              message._id
                            )
                          }
                          disabled={isRecovering}
                          style={{
                            border: "none",
                            borderRadius: "7px",
                            padding: "8px 12px",
                            background: "#4caf50",
                            color: "#fff",
                            cursor: isRecovering
                              ? "not-allowed"
                              : "pointer",
                            fontSize: "12px",
                            opacity: isRecovering
                              ? 0.6
                              : 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isRecovering
                            ? "Recovering..."
                            : "Recover for Me"}
                        </button>

                        {/* RECOVER FOR EVERYONE */}

                        <button
                          onClick={() =>
                            handleRecoverForEveryone(
                              message._id
                            )
                          }
                          disabled={isRecovering}
                          style={{
                            border: "none",
                            borderRadius: "7px",
                            padding: "8px 12px",
                            background: "#2196f3",
                            color: "#fff",
                            cursor: isRecovering
                              ? "not-allowed"
                              : "pointer",
                            fontSize: "12px",
                            opacity: isRecovering
                              ? 0.6
                              : 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isRecovering
                            ? "Recovering..."
                            : "Recover for Everyone"}
                        </button>
                      </>
                    )}

                  {/* =========================================
                      DELETE FOR EVERYONE
                      RECEIVER
                     ========================================= */}

                  {message.deletedForEveryone &&
                    !isSender && (
                      <span
                        style={{
                          fontSize: "12px",
                          color:
                            theme.secondaryText,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Deleted by sender
                      </span>
                    )}

                  {/* =========================================
                      DELETE FOR ME
                     ========================================= */}

                  {!message.deletedForEveryone && (
                    <button
                      onClick={() =>
                        handleRecoverForMe(
                          message._id
                        )
                      }
                      disabled={isRecovering}
                      style={{
                        border: "none",
                        borderRadius: "7px",
                        padding: "8px 16px",
                        background: "#4caf50",
                        color: "#fff",
                        cursor: isRecovering
                          ? "not-allowed"
                          : "pointer",
                        fontSize: "12px",
                        opacity: isRecovering
                          ? 0.6
                          : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isRecovering
                        ? "Recovering..."
                        : "Recover"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentlyDeleted;