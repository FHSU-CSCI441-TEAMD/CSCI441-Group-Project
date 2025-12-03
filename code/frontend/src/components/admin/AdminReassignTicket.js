import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "../../TicketsContext";
import NavigationBar from "../NavigationBar";
import "./AdminReassignTicket.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function AdminReassignTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, fetchTickets } = useTickets();

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/");
      return;
    }
    loadAgents();
  }, [currentUser]);

  const loadAgents = async () => {
    const res = await fetch(`${API_BASE}/api/users`, {
      credentials: "include",
    });
    const all = await res.json();
    setAgents(all.filter((u) => u.role === "Agent"));
  };

  const submitReassign = async () => {
    await fetch(`${API_BASE}/api/tickets/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: selectedAgent }),
    });

    await fetchTickets();
    navigate("/admin-home");
  };

  return (
    <div>
      <NavigationBar />

      <div className="reassign-container">
        <h2 className="reassign-title">Reassign Ticket</h2>

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="reassign-select"
        >
          <option value="">Select an Agent</option>
          {agents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.email}
            </option>
          ))}
        </select>

        <button onClick={submitReassign} className="reassign-button">
          Save
        </button>
      </div>
    </div>
  );
}
