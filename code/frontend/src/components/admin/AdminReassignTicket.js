// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/");
      return;
    }
    loadAgents();
  }, [currentUser]);

  const loadAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load agents");

      const all = await res.json();
      setAgents(all.filter((u) => u.role === "Agent"));
    } catch (err) {
      console.error(err);
      setError("Unable to load agent list.");
    }
  };

  const submitReassign = async () => {
    if (!selectedAgent) {
      alert("Please select an agent before saving.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent }),
      });

      const data = await res.json();
      console.log("Reassign Response:", data);

      if (!res.ok) {
        alert(data.message || "Failed to reassign ticket.");
        return;
      }

      // Successful update
      await fetchTickets();
      navigate("/admin-home");
    } catch (err) {
      console.error("Reassign error:", err);
      alert("Network error while saving.");
    }
  };

  return (
    <div>
      <NavigationBar />

      <div className="reassign-container">
        <h2 className="reassign-title">Reassign Ticket</h2>

        {/* Error Display */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="reassign-select"
        >
          <option value="">Select an Agent</option>
          {agents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.email})
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
