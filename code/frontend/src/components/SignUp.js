// src/components/SignUp.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignUp.css";

//const API_BASE = "https://csci441-group-project.onrender.com";
//const API_BASE = "http://localhost:5000";
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";


export default function SignUp() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Customer"); // 👈 default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password rules
  const passwordRules = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[@$!%*?&]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isPasswordValid) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 👇 Build the full User object
      const newUser = {
        userId: email.trim(),           // ✅ userId = email
        name: name.trim(),              // ✅ backend expects `name`
        email: email.trim(),
        password,                       // ✅ backend will hash
        role,                           // ✅ selected via radio buttons
        createdAt: new Date().toISOString(),
      };

      console.log("Registering new user:", newUser);

      const response = await fetch(
        `${API_BASE}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      alert("Account created successfully! Please log in.");
      navigate("/"); // redirect to login page
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-title">Create New Account</h2>

        {error && <p className="error-message">{error}</p>}

        <label>Full Name*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email*</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password*</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <ul className="password-rules">
          <li style={{ color: passwordRules.minLength ? "green" : "red" }}>
            At least 8 characters
          </li>
          <li style={{ color: passwordRules.uppercase ? "green" : "red" }}>
            One uppercase letter
          </li>
          <li style={{ color: passwordRules.number ? "green" : "red" }}>
            One number
          </li>
          <li style={{ color: passwordRules.specialChar ? "green" : "red" }}>
            One special character (@$!%*?&)
          </li>
        </ul>

        <label>Confirm Password*</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <fieldset className="role-section">
          <legend>Select Role*</legend>
          <div className="role-options">
            <label>
              <input
                type="radio"
                name="role"
                value="Customer"
                checked={role === "Customer"}
                onChange={(e) => setRole(e.target.value)}
              />
              Customer
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="Agent"
                checked={role === "Agent"}
                onChange={(e) => setRole(e.target.value)}
              />
              Agent
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={role === "Admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </form>
    </div>
  );
}
