// src/components/TicketComments.jsx
import React, { useState, useEffect } from "react";
import { useTickets } from "../TicketsContext";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function TicketComments({ ticketId }) {
  const { currentUser } = useTickets();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/tickets/${ticketId}`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (response.ok) {
          setComments(data.comments || []);
        } else {
          setError(data.message || "Failed to load comments");
        }
      } catch {
        setError("Network error loading comments");
      }
    };

    loadComments();
  }, [ticketId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Add new comment to UI
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch (err) {
      setError(err.message || "Error sending comment");
    }
  };

  return (
    <div className="ticket-comments">
      <h3>Comments</h3>

      {error && <p className="error">{error}</p>}

      {/* Comments list */}
      <ul className="comments-list">
        {comments.map((c, index) => (
          <li key={index}>
            <strong>{c.authorName}</strong>
            <span style={{ marginLeft: "10px", fontSize: "0.8rem", opacity: 0.7 }}>
              {new Date(c.createdAt).toLocaleString()}
            </span>
            <p>{c.message}</p>
          </li>
        ))}
      </ul>

      {/* Add comment box */}
      <div className="comment-input">
        <textarea
          value={newComment}
          placeholder="Add a comment..."
          onChange={(e) => setNewComment(e.target.value)}
        />

        <button onClick={submitComment}>
          Post Comment
        </button>
      </div>
    </div>
  );
}
