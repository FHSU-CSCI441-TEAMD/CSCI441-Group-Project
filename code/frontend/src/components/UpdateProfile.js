import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./UpdateProfile.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function UpdateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: "",
    password: "",
    confirmPassword: "",
  });

  const [original, setOriginal] = useState({ name: "", email: "" });
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // ------------------------------------------------------------
  // Centralized redirect function
  // ------------------------------------------------------------
  const redirectUserByRole = (role) => {
    if (role === "Admin") return navigate("/admin-home");
    if (role === "Agent") return navigate("/agent-home");
    return navigate("/home"); // Customer fallback
  };

  // ------------------------------------------------------------
  // Load user profile
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile.");

        setFormData({
          name: data.name,
          email: data.email,
          userId: data.email,
          password: "",
          confirmPassword: "",
        });

        setOriginal({ name: data.name, email: data.email });
        setRole(data.role || "Customer");

      } catch (err) {
        setError(err.message || "Network error loading profile.");
      }
    };

    fetchProfile();
  }, []);

  // ------------------------------------------------------------
  // Detect changes
  // ------------------------------------------------------------
  const isDirty = useMemo(() => {
    const nameChanged = formData.name.trim() !== original.name.trim();
    const emailChanged = formData.email.trim() !== original.email.trim();
    const passChanged = !!formData.password || !!formData.confirmPassword;
    return nameChanged || emailChanged || passChanged;
  }, [formData, original]);

  // ------------------------------------------------------------
  // Handle input
  // ------------------------------------------------------------
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage("");
    setError("");
  };

  // ------------------------------------------------------------
  // Save changes
  // ------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isDirty) return setError("No changes to save.");

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const body = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) body.password = formData.password;

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      // Update local state
      setMessage("Profile updated successfully!");
      setOriginal({ name: formData.name, email: formData.email });
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setIsEditing(false);

      // 🔥 Redirect immediately (fix for your issue!)
      redirectUserByRole(role);

    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    }
  };

  // ------------------------------------------------------------
  // Cancel editing
  // ------------------------------------------------------------
  const handleCancel = () => {
    setFormData({
      name: original.name,
      email: original.email,
      userId: original.email,
      password: "",
      confirmPassword: "",
    });

    setIsEditing(false);
    setMessage("");
    setError("");

    redirectUserByRole(role); // Cancel works exactly the same
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="update-profile-container">
      <h2>Profile Details</h2>

      <form onSubmit={handleSubmit}>
        {/* USER ID */}
        <div className="form-group">
          <label>User ID (email)</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            readOnly
            className="readonly"
          />
        </div>

        {/* NAME */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        {/* PASSWORDS */}
        {isEditing && (
          <>
            <div className="form-group">
              <label>New Password (optional)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
              />
            </div>
          </>
        )}

        {/* BUTTONS */}
        <div className="button-row">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="save-btn"
                disabled={!isDirty}
                title={isDirty ? "Save changes" : "No changes to save"}
              >
                💾 Save Changes
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                ✖ Cancel
              </button>
            </>
          )}
        </div>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
