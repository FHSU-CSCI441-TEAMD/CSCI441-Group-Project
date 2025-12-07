// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/components/TicketDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import TicketComments from "./TicketComments";
import { useTickets } from "../TicketsContext";
import "./TicketDetails.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function TicketDetails() {
  const { id } = useParams();
  const { currentUser } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  // Determine home route based on role
  const getHomeRoute = () => {
    if (currentUser?.role === "Admin") return "/admin-reports";
    if (currentUser?.role === "Agent") return "/agent-home";
    return "/home";
  };

  // Fetch ticket details
  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load ticket");

        const data = await res.json();
        setTicket(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load ticket details.");
      }
    };

    loadTicket();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Loading...</p>;

  const canEdit =
    currentUser?.role === "Admin" || currentUser?.role === "Agent";

  return (
    <>
      <NavigationBar />

      <div className="ticket-details-wrapper">
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
                <td>{ticket.status}</td>
              </tr>

              <tr>
                <th>Priority:</th>
                <td>{ticket.priority}</td>
              </tr>

              <tr>
                <th>Assigned Agent:</th>
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

              <tr>
                <th>Description:</th>
                <td>{ticket.description || "No description provided."}</td>
              </tr>
            </tbody>
          </table>

          <TicketComments ticketId={ticket._id} />

          {canEdit && (
            <Link to={`/ticket-update/${ticket._id}`} className="edit-ticket-button">
              ✏️ Edit Ticket
            </Link>
          )}

          <Link to={getHomeRoute()} className="back-button">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    </>
  );
}
