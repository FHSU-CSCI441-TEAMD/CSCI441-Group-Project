// src/components/AdminReports/AdminReports.js
import React, { useEffect, useMemo, useState } from "react";
import { useTickets } from "../../TicketsContext";
import NavigationBar from "../NavigationBar";
import "./AdminReports.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function AdminReports() {
  const { tickets } = useTickets();

  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [agents, setAgents] = useState([]);

  // Fetch all users, then filter agents
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          credentials: "include",
        });

        if (!res.ok) return;

        const allUsers = await res.json();
        setAgents(allUsers.filter((u) => u.role === "Agent"));
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };

    loadUsers();
  }, []);

  // Create lookup map for agentId → agent user object
  const agentMap = useMemo(() => {
    const map = {};
    agents.forEach((a) => {
      map[a._id] = a;
    });
    return map;
  }, [agents]);

  // Filtering logic (updated to use assignedAgentId)
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const agentId = t.assignedAgentId || null;

      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (agentFilter && agentId !== agentFilter) return false;

      return true;
    });
  }, [tickets, statusFilter, priorityFilter, agentFilter]);

  // Summary counts
  const statusSummary = useMemo(() => {
    const summary = {};
    filteredTickets.forEach((t) => {
      summary[t.status] = (summary[t.status] || 0) + 1;
    });
    return summary;
  }, [filteredTickets]);

  return (
    <div>
      <NavigationBar />

      <div className="admin-reports-container">
        <h1 className="admin-reports-title">Admin Ticket Reports</h1>

        {/* FILTERS */}
        <div className="filter-section">

          {/* Status */}
          <div>
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Agent */}
          <div>
            <label>Agent:</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            className="reset-btn"
            onClick={() => {
              setStatusFilter("");
              setAgentFilter("");
              setPriorityFilter("");
            }}
          >
            Reset Filters
          </button>
        </div>

        {/* SUMMARY */}
        <div className="summary-box">
          <h2>Summary</h2>

          {Object.keys(statusSummary).length === 0 ? (
            <p>No tickets match your filters.</p>
          ) : (
            <ul>
              {Object.entries(statusSummary).map(([status, count]) => (
                <li key={status}>
                  <strong>{status}:</strong> {count} ticket(s)
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TICKETS TABLE */}
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned Agent</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((t) => {
              const agentId = t.assignedAgentId || null;
              const agent = agentMap[agentId];

              return (
                <tr key={t._id}>
                  <td>{t._id}</td>
                  <td>{t.title}</td>
                  <td>{t.status}</td>
                  <td>{t.priority}</td>
                  <td>
                    {agent
                      ? `${agent.name} (${agent.email})`
                      : "Unassigned"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <p>No tickets found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}
