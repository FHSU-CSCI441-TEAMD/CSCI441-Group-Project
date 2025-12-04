// UPDATED AdminReports.js
import React, { useEffect, useMemo, useState } from "react";
import { useTickets } from "../../TicketsContext";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../NavigationBar";
import "./AdminReports.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function AdminReports() {
  const { tickets, fetchTickets } = useTickets();  // 👈 fetchTickets added here
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [users, setUsers] = useState([]);

  // ============================================================
  // FORCE REFRESH of tickets EVERY TIME page is loaded
  // ============================================================
  useEffect(() => {
    fetchTickets();  // 👈 FIX — always reload tickets!
  }, []);

  // ============================================================
  // Load ALL users (backend does NOT populate agent field)
  // ============================================================
  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    };

    loadUsers();
  }, []);

  // Build map: agentId → user object
  const agentMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  // Agents dropdown list
  const agents = useMemo(() => {
    return users.filter((u) => u.role === "Agent");
  }, [users]);

  // Apply filters
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (agentFilter && t.agent !== agentFilter) return false; // agent stored as ID
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, agentFilter]);

  // Summary section
  const statusSummary = useMemo(() => {
    const summary = {};
    filteredTickets.forEach((t) => {
      summary[t.status] = (summary[t.status] || 0) + 1;
    });
    return summary;
  }, [filteredTickets]);

  const openTicket = (id) => navigate(`/ticket/${id}`);

  return (
    <div>
      <NavigationBar />

      <div className="admin-reports-container">
        <h1 className="admin-reports-title">Admin Ticket Reports</h1>

        {/* FILTERS */}
        <div className="filter-section">
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
            <p>No tickets match the selected filters.</p>
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
              <th>Customer</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned Agent</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((t) => {
            const agentId =
              t.agent?._id ||
              t.agent ||
              t.assignedAgentId ||
              t.assignedAgent ||
              null;

            const agent = agentMap[agentId];
              return (
                <tr
                  key={t._id}
                  className="clickable-report-row"
                  onClick={() => openTicket(t._id)}
                >
                  <td>{t.customer?.name || "Unknown"}</td>
                  <td>{t.title}</td>
                  <td>{t.status}</td>
                  <td>{t.priority}</td>
                  <td>{agent ? `${agent.name} (${agent.email})` : "Unassigned"}</td>
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
