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
    <>
      <NavigationBar />
      <div className="ticket-details">
        <h2>Ticket Details</h2>

        <table className="ticket-info-table">
          <tbody>
            <tr>
              <th>Title:</th>
              <td>{ticket.title}</td>
            </tr>
            <tr>
              <th>Status:</th>
              <td className={`status ${ticket.status?.toLowerCase()}`}>{ticket.status}</td>
            </tr>
            <tr>
              <th>Priority:</th>
              <td className={`priority ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</td>
            </tr>
            <tr>
              <th>Agent:</th>
              <td>{ticket.agent?.name || "Unassigned"}</td>
            </tr>
            <tr>
              <th>Created:</th>
              <td>{new Date(ticket.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Updated:</th>
              <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
            </tr>
            <tr className="desc-row">
              <th>Description:</th>
              <td className="desc-cell">
                {ticket.description || "No description provided."}
              </td>
            </tr>
          </tbody>
        </table>

        <Link to="/home" className="back-button">← Back to Tickets</Link>
      </div>
    </>
  );
}

export default TicketDetails;