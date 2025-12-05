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

  // ❗ Only use currentUser + fetchTickets from context here
  const { currentUser, fetchTickets } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");

  // Determine home route by role
  const getHomeRoute = () => {
    if (currentUser?.role === "Admin") return "/admin-home";
    if (currentUser?.role === "Agent") return "/agent-home";
    return "/home";
  };

  // Fetch ticket + agents (for Admin)
  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch ticket");

        const data = await res.json();
        // data.agent is POPULATED here (because getTicketById uses populate)
        setTicket(data);

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

    loadTicket();
  }, [id, currentUser?.role]);

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Loading...</p>;

  // Permissions
  const isAdmin = currentUser?.role === "Admin";
  const isAssignedAgent =
    currentUser?.role === "Agent" &&
    (ticket.agent?._id === currentUser?._id ||
      ticket.agent === currentUser?._id);

  const canEditStatus = isAdmin || isAssignedAgent;

  // ---------- STATUS LOGIC ----------
  const currentStatusValue =
    typeof ticket.status === "string" && ticket.status.length > 0
      ? ticket.status
      : "Open";

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticket._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updated = await res.json();
      if (!res.ok) {
        alert(updated.message || "Failed to update status.");
        return;
      }

      // ✅ UI-first update: keep local ticket shape, only change status/updatedAt
      setTicket((prev) => ({
        ...prev,
        status: newStatus,
        updatedAt: updated.updatedAt || prev.updatedAt,
      }));

      // ✅ refresh global list for Admin/Agent dashboards
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Network error updating status.");
    }
  };

  // ---------- ASSIGNED AGENT LOGIC ----------
  // Normalize agent ID for dropdown value
  const currentAgentId =
    ticket.agent && typeof ticket.agent === "object"
      ? ticket.agent._id
      : typeof ticket.agent === "string"
      ? ticket.agent
      : "";

  const updateAssignedAgent = async (agentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticket._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const updated = await res.json();
      if (!res.ok) {
        alert(updated.message || "Failed to reassign ticket.");
        return;
      }

      // Find the full agent object from our local agents list
      const selectedAgent =
        agents.find((a) => a._id === agentId) || null;

      // ✅ Keep ticket.agent as full object so label + dropdown both work
      setTicket((prev) => ({
        ...prev,
        agent: selectedAgent,
        updatedAt: updated.updatedAt || prev.updatedAt,
      }));

      // Refresh global tickets for reports/home views
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Network error reassigning agent.");
    }
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
                      value={currentStatusValue}
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
                  {/* Label: use populated object if available */}
                  {ticket.agent && typeof ticket.agent === "object"
                    ? ticket.agent.name
                    : "Unassigned"}

                  {isAdmin && (
                    <select
                      className="assign-dropdown"
                      value={currentAgentId}
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

          {/* Comments */}
          <TicketComments ticketId={ticket._id} />

          {/* Back Button */}
          <Link to={getHomeRoute()} className="back-button">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    </>
  );
}

export default TicketDetails;
