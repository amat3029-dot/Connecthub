import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import chatImage from "../assets/register.jpg";

function Register() {
      const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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
      "/auth/register",
      formData
    );

    console.log(response.data);

    alert("User Registered Successfully");

    navigate("/");
  } catch (error) {
    console.log(error.response?.data);

    alert("Registration Failed");
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
        width: "420px",
        padding: "40px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>
        ConnectHub
      </h1>

      <p style={{ marginBottom: "30px" }}>
        Create your account
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
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
            boxSizing: "border-box",
          }}
        />
  <input
  type="tel"
  name="phone"
  placeholder="Enter Phone Number"
  value={formData.phone}
  onChange={handleChange}
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
            marginBottom: "15px",
          }}
        >
          Register
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/")}
          style={{
            color: "#60a5fa",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </span>
      </p>
    </div>
  </div>
);
}

export default Register;