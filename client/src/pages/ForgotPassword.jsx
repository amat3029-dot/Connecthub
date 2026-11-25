import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STEP 1: Verify Email
    if (!emailVerified) {
      try {
        await API.post("/auth/check-email", {
          email,
        });

        alert("Email Found");

        setEmailVerified(true);

      } catch (error) {
        alert("Email Not Found");
      }

      return;
    }

    // STEP 2: Update Password

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      await API.put("/auth/reset-password", {
        email,
        password,
      });

      alert("Password Updated Successfully");

      navigate("/");

    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "30px",
          }}
        >
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>

          {!emailVerified ? (

            <>
              <input
                type="email"
                placeholder="Enter Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                Continue
              </button>

            </>

          ) : (

            <>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                Update Password
              </button>

            </>

          )}

        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;