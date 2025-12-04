// src/components/TicketsTable.js
import React, { useEffect, useMemo, useState } from "react";
import { useTickets } from "../TicketsContext";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, currentUser } = useTickets();
  const tickets = propTickets || contextTickets || [];
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  // Load ALL users to resolve agent ID → user
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

  // Build map: userId → user object
  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const openTicket = (id) => navigate(`/ticket/${id}`);

  return (
    <div className="tickets-table-container">
      <h3>{currentUser ? `${currentUser.name}'s Tickets` : "All Tickets"}</h3>

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
            const agentId = t.agent || null;
            const agent = agentId ? userMap[agentId] : null;

            return (
              <tr
                key={t._id}
                className="clickable-row"
                onClick={() => openTicket(t._id)}
              >
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>

                {/* Agent Name Column */}
                <td>
                  {agent
                    ? `${agent.name} (${agent.email})`
                    : "Unassigned"}
                </td>

                <td>{formatDate(t.createdAt)}</td>
                <td>
                  {t.updatedAt && t.updatedAt !== t.createdAt
                    ? formatDate(t.updatedAt)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
