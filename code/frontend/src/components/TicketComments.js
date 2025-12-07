// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/components/TicketComments.js
import React, { useEffect, useState } from "react";
import "./TicketComments.css";
import { useTickets } from "../TicketsContext";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function TicketComments({ ticketId }) {
  const { currentUser } = useTickets();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments when component loads
  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${ticketId}`, {
          credentials: "include",
        });

        if (!res.ok) return;

        const ticket = await res.json();
        setComments(ticket.comments || []);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    loadComments();
  }, [ticketId]);

  // Submit new comment
  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newComment,
        }),
      });

      if (!res.ok) {
        alert("Failed to submit comment");
        return;
      }

      const saved = await res.json();

      // Add new comment to UI
      setComments((prev) => [...prev, saved]);

      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <div className="comments-wrapper">
      <h3>Comments</h3>

      {/* Comment List */}
      <div className="comments-list">
        {comments.length === 0 && <p>No comments yet.</p>}

        {comments.map((c) => (
          <div key={c._id} className="comment-card">
            <div className="comment-header">
              <strong>{c.author?.name || c.author?.email || "Unknown User"}</strong>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Add Comment Box */}
      <div className="comment-input-wrapper">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type a comment..."
          className="comment-textarea"
        />

        <button onClick={submitComment} className="comment-submit-btn">
          Add Comment
        </button>
      </div>
    </div>
  );
}
