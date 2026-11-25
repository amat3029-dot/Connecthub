import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function OtpVerification() {
  const location = useLocation();
  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

const handleChange = (value, index) => {
  if (!/^\d?$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};
const handleKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};
  const resendOTP = () => {
    setTimer(30);
    alert("OTP Resend Logic Here");
  };

  const verifyOTP = () => {
    alert("Verify OTP Logic Here");
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#4F46E5,#7C3AED,#2563EB)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "430px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(15px)",
          borderRadius: "25px",
          padding: "40px",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,.3)",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>OTP Verification</h1>

        <p style={{ color: "#eee" }}>
          Enter the verification code sent to
        </p>

        <h3 style={{ marginBottom: "30px" }}>{phone}</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          {otp.map((digit, index) => (
           <input
  key={index}
  ref={(el) => (inputRefs.current[index] = el)}
  type="text"
  inputMode="numeric"
  autoComplete="one-time-code"
  value={digit}
  maxLength={1}
  onChange={(e) => handleChange(e.target.value, index)}
  onKeyDown={(e) => handleKeyDown(e, index)}
  style={{
    width: "50px",
    height: "55px",
    borderRadius: "12px",
    border: "2px solid #ddd",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    outline: "none",
    cursor: "text",
    transition: "0.3s",
  }}
  onFocus={(e) => {
    e.target.style.border = "2px solid #4F46E5";
    e.target.style.boxShadow = "0 0 10px rgba(79,70,229,.4)";
  }}
  onBlur={(e) => {
    e.target.style.border = "2px solid #ddd";
    e.target.style.boxShadow = "none";
  }}
/>
          ))}
        </div>

        <button
          onClick={verifyOTP}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "12px",
            background: "#22C55E",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Verify OTP
        </button>

        <div style={{ marginTop: "25px" }}>
          {timer > 0 ? (
            <p style={{ color: "#fff" }}>
              Resend OTP in <b>{timer}s</b>
            </p>
          ) : (
            <button
              onClick={resendOTP}
              style={{
                background: "none",
                border: "none",
                color: "#FFD54F",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;