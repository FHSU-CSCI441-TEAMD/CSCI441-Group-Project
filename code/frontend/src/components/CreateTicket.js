// src/components/CreateTicket.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTicket.css";
import { useTickets } from "../TicketsContext";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function CreateTicket() {
  const navigate = useNavigate();
  const { currentUser, refreshCurrentUser, createTicket, fetchTickets } = useTickets();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const makeTicketId = () =>
    `TIX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim() || !formData.priority) {
      setError("Please complete Title, Description, and Priority.");
      return;
    }

    setSubmitting(true);
    try {
      // Ensure user is loaded
      let user = currentUser || (await refreshCurrentUser());
      if (!user) {
        setError("You must be logged in to create a ticket.");
        setSubmitting(false);
        return;
      }

      const now = new Date().toISOString();
      const payload = {
        ticketId: makeTicketId(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: "Open",
        priority: formData.priority,
        customer: user._id,
        agent: null,
        createdAt: now,
        updatedAt: now,
      };

      console.log("📝 Creating ticket:", payload);

      // Use context createTicket to post to backend
      const saved = await createTicket(payload);

      if (saved) {
        console.log("✅ Ticket created successfully:", saved);
        await fetchTickets(); // refresh list before navigation
        alert("Ticket created successfully!");
        navigate("/home");
      } else {
        throw new Error("Failed to create ticket.");
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      setError(err.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="formContainer">
        <h3>Create New Ticket</h3>
        <p>Required fields are marked with an asterisk*.</p>

        {error && <p className="error-message">{error}</p>}

        <form className="ticketForm" onSubmit={handleSubmit}>
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description of Issue*</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            maxLength={4000}
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Priority*</label>
          <div className="radioGroup">
            {["Low", "Medium", "High"].map((level) => (
              <label key={level} className="radioOption">
                <input
                  type="radio"
                  name="priority"
                  value={level}
                  checked={formData.priority === level}
                  onChange={handleChange}
                />
                {level}
              </label>
            ))}
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default CreateTicket;
