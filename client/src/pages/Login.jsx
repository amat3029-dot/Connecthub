import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import chatImage from "../assets/loginimage.jpg";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [phone, setPhone] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {
      console.log(error.response?.data);

      alert("Credentials are invalid");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${chatImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "40px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1 style={{ marginBottom: "30px" }}>
          ConnectHub
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              fontSize: "16px",
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              fontSize: "16px",
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
            Login
          </button>
          <hr
            style={{
              margin: "25px 0",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          or
          <h3 style={{ marginBottom: "15px" }}>
            Login with Phone Number
          </h3>
          <input
            type="tel"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => navigate("/otp", { state: { phone } })}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            Send OTP
          </button>
        </form>
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          <span
            onClick={() => navigate("/forgot-password")}
            style={{
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Forgot Password?
          </span>

          {" | "}

          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Register a new account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;