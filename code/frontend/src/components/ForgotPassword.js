// src/components/ForgotPassword.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Password reset link sent to your email.");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="reset-container">
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Reset Link</button>
        <p className="login-page">
          Return to <Link to="/">Log in</Link>
        </p>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ForgotPassword;