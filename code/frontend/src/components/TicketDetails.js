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

function TicketDetails() {
  const { id } = useParams();
  const { currentUser, updateTicket } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");

  // Determine home route by role
  const getHomeRoute = () => {
    if (currentUser?.role === "Admin") return "/admin-reports";
    if (currentUser?.role === "Agent") return "/agent-home";
    return "/home";
  };

  // Fetch ticket + agents (if admin)
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch ticket");

        const data = await res.json();
        setTicket(data);

        // Admin → fetch all users and filter agents
        if (currentUser?.role === "Admin") {
          const usersRes = await fetch(`${API_BASE}/api/users`, {
            credentials: "include",
          });

          if (usersRes.ok) {
            const allUsers = await usersRes.json();
            const onlyAgents = allUsers.filter((u) => u.role === "Agent");
            setAgents(onlyAgents);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load ticket details.");
      }
    };

    fetchTicket();
  }, [id, currentUser?.role]);

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Loading...</p>;

  // Permissions
  const isAdmin = currentUser?.role === "Admin";

  const isAssignedAgent =
    currentUser?.role === "Agent" &&
    ticket.agent?._id === currentUser?._id;

  const canEditStatus = isAdmin || isAssignedAgent;

  // Update Status
  const updateStatus = async (newStatus) => {
    const updated = await updateTicket(ticket._id, { status: newStatus });
    if (updated) setTicket(updated);
  };

  // Admin: Update Assigned Agent
  const updateAssignedAgent = async (agentId) => {
    const updated = await updateTicket(ticket._id, { agentId });
    if (updated) setTicket(updated);
  };

  return (
    <>
      <NavigationBar />

      <div className="ticket-details-wrapper">
        <div className="ticket-details">
          <h2>Ticket Details</h2>

          <table className="ticket-info-table">
            <tbody>
              {/* Title */}
              <tr>
                <th>Title:</th>
                <td>{ticket.title}</td>
              </tr>

              {/* Status */}
              <tr>
                <th>Status:</th>
                <td>
                  {canEditStatus ? (
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      className="status-dropdown"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className={`status ${ticket.status?.toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  )}
                </td>
              </tr>

              {/* Priority */}
              <tr>
                <th>Priority:</th>
                <td className={`priority ${ticket.priority?.toLowerCase()}`}>
                  {ticket.priority}
                </td>
              </tr>

              {/* Assigned Agent */}
              <tr>
                <th>Assigned Agent:</th>
                <td>
                  {ticket.agent?.name || "Unassigned"}

                  {isAdmin && (
                    <select
                      className="assign-dropdown"
                      value={ticket.agent?._id || ""}
                      onChange={(e) => updateAssignedAgent(e.target.value)}
                      style={{ marginLeft: "12px" }}
                    >
                      <option value="">-- Assign Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>

              {/* Created */}
              <tr>
                <th>Created:</th>
                <td>{new Date(ticket.createdAt).toLocaleString()}</td>
              </tr>

              {/* Updated */}
              <tr>
                <th>Updated:</th>
                <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
              </tr>

              {/* Description */}
              <tr className="desc-row">
                <th>Description:</th>
                <td className="desc-cell">
                  {ticket.description || "No description provided."}
                </td>
              </tr>
            </tbody>
          </table>

          <TicketComments ticketId={ticket._id} />

      <Link
        to={getHomeRoute()}
        className="back-button"
        onClick={() => {
          // force refresh on return
          setTimeout(() => window.location.reload(), 10);
        }}
      >
        ← Back to Tickets
      </Link>

        </div>
      </div>
    </>
  );
}

export default TicketDetails;
