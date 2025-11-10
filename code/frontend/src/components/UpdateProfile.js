import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./UpdateProfile.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: "",
    password: "",
    confirmPassword: "",
  });
  const [original, setOriginal] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("");

  // 🧭 Load current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setFormData({
            name: data.name,
            email: data.email,
            userId: data.email,
            password: "",
            confirmPassword: "",
          });
          setOriginal({ name: data.name, email: data.email });
          setRole(data.role || "Customer"); // store user role
        } else {
          setError(data.message || "Failed to load profile.");
        }
      } catch {
        setError("Network error loading profile.");
      }
    };

    fetchProfile();
  }, []);

  // 🧩 Detect if there are changes
  const isDirty = useMemo(() => {
    const nameChanged = formData.name.trim() !== original.name.trim();
    const emailChanged = formData.email.trim() !== original.email.trim();
    const passFilled = !!formData.password || !!formData.confirmPassword;
    return nameChanged || emailChanged || passFilled;
  }, [formData, original]);

  // 🧩 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setError("");
  };

  // 💾 Submit changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isDirty) {
      setError("No changes to save.");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
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

      if (res.ok) {
        setMessage("✅ Profile updated successfully.");
        setOriginal({ name: formData.name, email: formData.email });
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setIsEditing(false);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch {
      setError("❌ Network error. Please try again.");
    }
  };

  // ✏️ Toggle Edit Mode
  const toggleEdit = (e) => {
    e.preventDefault();
    setIsEditing((prev) => !prev);
    setMessage("");
    setError("");
  };

  // 🚫 Cancel editing — reset and redirect
  const handleCancel = (e) => {
    e.preventDefault();
    // Reset fields
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

    // Redirect based on role
    if (role === "Agent") navigate("/agent-home");
    else if (role === "Admin") navigate("/admin-home");
    else navigate("/home");
  };

  return (
    <div className="update-profile-container">
      <h2>Profile Details</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">User ID (email)</label>
          <input
            id="userId"
            type="text"
            name="userId"
            value={formData.userId}
            readOnly
            className="readonly"
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        {isEditing && (
          <>
            <div className="form-group">
              <label htmlFor="password">New Password (optional)</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
              />
            </div>
          </>
        )}

        <div className="button-row">
          {!isEditing ? (
            <button type="button" onClick={toggleEdit} className="edit-btn">
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="save-btn"
                disabled={!isDirty}
                aria-disabled={!isDirty}
                title={!isDirty ? "No changes to save" : "Save changes"}
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
};

export default UpdateProfile;