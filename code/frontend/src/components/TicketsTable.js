// UPDATED TicketsTable.js
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

  const [users, setUsers] = useState([]);

  // Load all users
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    };
    load();
  }, []);

  // Build lookup
  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => (map[u._id] = u));
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

  const handleRowClick = (ticketId) => navigate(`/ticket/${ticketId}`);

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

            // 🔥 resolve correct agent field
            const agentId =
              t.assignedAgentId ||
              t.agentId ||
              t.agent?._id ||
              t.agent; // fallback

            const agent = agentId ? userMap[agentId] : null;

            return (
              <tr
                key={t._id}
                onClick={() => handleRowClick(t._id)}
                className="clickable-row"
              >
                <td>{t.title || "Untitled"}</td>
                <td className={`status ${t.status?.toLowerCase()}`}>
                  {t.status}
                </td>
                <td className={`priority ${t.priority?.toLowerCase()}`}>
                  {t.priority}
                </td>

                {/* Display agent properly */}
                <td>
                  {agent
                    ? `${agent.name} (${agent.email})`
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
