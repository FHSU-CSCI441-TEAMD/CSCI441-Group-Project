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
  const { currentUser } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]); // Admin-only agent list
  const [error, setError] = useState("");

  // ------------------------------------
  // Fetch ticket details + agent list
  // ------------------------------------
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch ticket");

        const data = await res.json();
        setTicket(data);

        // If Admin → Load list of agents
        if (currentUser?.role === "Admin") {
          const agentRes = await fetch(`${API_BASE}/api/users/agents`, {
            credentials: "include",
          });

          if (agentRes.ok) {
            const agentsData = await agentRes.json();
            setAgents(agentsData);
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

  // ------------------------------------
  // Role Helper Logic
  // ------------------------------------
  const isAdmin = currentUser?.role === "Admin";
  const isAssignedAgent =
    currentUser?.role === "Agent" &&
    ticket.assignedAgentId === currentUser?.id;

  const canEditStatus = isAdmin || isAssignedAgent;

  // ------------------------------------
  // Update Status
  // ------------------------------------
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticket._id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update status.");
        return;
      }

      // Update UI locally
      setTicket((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Network error updating status.");
    }
  };

  // ------------------------------------
  // Admin: Reassign Agent
  // ------------------------------------
  const updateAssignedAgent = async (agentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticket._id}/assign`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to reassign ticket");
        return;
      }

      // Update UI with new agent
      setTicket((prev) => ({
        ...prev,
        assignedAgentId: agentId,
        agent: data.assignedAgent,
      }));

    } catch (err) {
      console.error(err);
      alert("Network error reassigning agent.");
    }
  };

  // ------------------------------------
  // UI
  // ------------------------------------
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

                  {/* Admin-only reassignment dropdown */}
                  {isAdmin && (
                    <select
                      className="assign-dropdown"
                      value={ticket.assignedAgentId || ""}
                      onChange={(e) => updateAssignedAgent(e.target.value)}
                      style={{ marginLeft: "12px" }}
                    >
                      <option value="">-- Assign Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
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

          {/* Comments Section */}
          <TicketComments ticketId={ticket._id} />

          {/* Back Button */}
          <Link to="/home" className="back-button">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    </>
  );
}

export default TicketDetails;
