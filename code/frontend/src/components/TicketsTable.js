// src/components/TicketsTable.js
import React, { useEffect, useMemo, useState } from "react";
import { useTickets } from "../TicketsContext";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, currentUser } = useTickets();
  const tickets = propTickets || contextTickets || [];
  const navigate = useNavigate();

  // 🔹 Load all users so we can resolve agent IDs → names
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };

    loadUsers();
  }, []);

  // 🔹 Build a quick lookup map: userId -> user object
  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!tickets.length) {
    return (
      <div className="tickets-empty">
        <p>No tickets found.</p>
      </div>
    );
  }

  const handleRowClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className="tickets-table-container">
      <h3>
        {currentUser ? `${currentUser.name}'s Tickets` : "All Tickets"}
      </h3>

      <table className="tickets-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Agent</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => {
            const created = formatDate(t.createdAt);
            const updated =
              t.updatedAt && t.updatedAt !== t.createdAt
                ? formatDate(t.updatedAt)
                : "—";

            // 🔹 agent is an ID string in your data, sometimes null
            const agentId =
              typeof t.agent === "object" && t.agent !== null
                ? t.agent._id
                : t.agent || null;

            const agent = agentId ? userMap[agentId] : null;

            return (
              <tr
                key={t._id || t.id}
                onClick={() => handleRowClick(t._id || t.id)}
                className="clickable-row"
              >
                <td>{t.title || "Untitled"}</td>

                <td className={`status ${t.status?.toLowerCase() || ""}`}>
                  {t.status || "Open"}
                </td>

                <td className={`priority ${t.priority?.toLowerCase() || ""}`}>
                  {t.priority || "N/A"}
                </td>

                <td>
                  {agent
                    ? `${agent.name || agent.email} (${agent.email})`
                    : "Unassigned"}
                </td>

                <td>{created}</td>
                <td>{updated}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TicketsTable;
