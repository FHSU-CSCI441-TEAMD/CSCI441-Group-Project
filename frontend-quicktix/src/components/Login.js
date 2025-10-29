// src/components/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useTickets } from "../TicketsContext"; // ✅ import context

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ bring in refresh + fetch from context
  const { setCurrentUser, refreshCurrentUser, fetchTickets } = useTickets();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 👈 send cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      console.log("✅ Login success:", data);

      // ✅ Persist user info locally
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);

      // ✅ Immediately refresh current user from backend (verifies cookie)
      await refreshCurrentUser();

      // ✅ Fetch user's tickets right after login
      await fetchTickets();

      // ✅ Redirect user
      const role = data.user?.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "agent") navigate("/agent");
      else navigate("/home");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Welcome back</h2>
        <p>Login with your QuickTix credentials</p>

        {error && <p className="error-message">{error}</p>}

        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="••••••••"
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="reset-link">
          Forgot your password? <Link to="/reset">Reset it</Link>
        </p>

        <p className="sign-up">
          Don't have an account? <Link to="/sign-up">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
