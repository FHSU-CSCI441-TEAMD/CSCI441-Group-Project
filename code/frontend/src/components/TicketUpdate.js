// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/components/TicketUpdate.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "../TicketsContext";
import NavigationBar from "./NavigationBar";
import "./TicketUpdate.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function TicketUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser, fetchTickets } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);

  const isAdmin = currentUser?.role === "Admin";
  const isAgent = currentUser?.role === "Agent";

  // Fetch ticket + agent list (admin only)
  useEffect(() => {
    const loadData = async () => {
      const ticketRes = await fetch(`${API_BASE}/api/tickets/${id}`, {
        credentials: "include",
      });
      const ticketData = await ticketRes.json();
      setTicket(ticketData);

      if (isAdmin) {
        const userRes = await fetch(`${API_BASE}/api/users`, {
          credentials: "include",
        });
        const allUsers = await userRes.json();
        setAgents(allUsers.filter((u) => u.role === "Agent"));
      }
    };

    loadData();
  }, [id, isAdmin]);

    const saveChanges = async () => {
    const updates = {};

    if (ticket.status) updates.status = ticket.status;
    if (isAdmin && ticket.agent?._id) updates.agentId = ticket.agent._id;

    await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    await fetchTickets();

    // Redirect based on role
    if (currentUser.role === "Admin") {
        navigate("/admin-reports");
    } else {
        navigate("/agent-home");
    }
    };


  if (!ticket) return <p>Loading...</p>;

  return (
    <>
      <NavigationBar />

      <div className="update-wrapper">
        <div className="update-card">
          <h2>Edit Ticket</h2>

          {/* Status always visible for Agent + Admin */}
          <label>Status</label>
          <select
            value={ticket.status}
            onChange={(e) =>
              setTicket({ ...ticket, status: e.target.value })
            }
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Assigned agent only for Admin */}
          {isAdmin && (
            <>
              <label>Assigned Agent</label>
              <select
                value={ticket.agent?._id || ""}
                onChange={(e) =>
                  setTicket({
                    ...ticket,
                    agent: { _id: e.target.value },
                  })
                }
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
            </>
          )}

          <button className="save-btn" onClick={saveChanges}>
            Save Changes
          </button>

            <button
            className="cancel-btn"
            onClick={() => navigate(`/ticket/${id}`, { replace: true })}
            >
            Cancel
            </button>

        </div>
      </div>
    </>
  );
}
