// src/components/TicketDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch ticket");
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError("Unable to load ticket details.");
      }
    };
    fetchTicket();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Loading...</p>;

  return (
    <div className="ticket-details">
      <h2>{ticket.title}</h2>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Priority:</strong> {ticket.priority}</p>
      <p><strong>Agent:</strong> {ticket.agent?.name || "Unassigned"}</p>
      <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
      <p><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
      <p><strong>Description:</strong></p>
      <p>{ticket.description || "No description provided."}</p>

      <Link to="/home" className="back-button">← Back to Tickets</Link>
    </div>
  );
}

export default TicketDetails;