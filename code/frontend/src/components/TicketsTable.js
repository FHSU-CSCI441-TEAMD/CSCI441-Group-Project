// src/components/TicketsTable.js
import React from "react";
import { useTickets } from "../TicketsContext";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";

export default function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, agentsMap } = useTickets();
  const tickets = propTickets || contextTickets || [];
  const navigate = useNavigate();

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

            // -------------------------------------
            // ⭐ AGENT NAME LOOKUP LOGIC
            // -------------------------------------

            let agentName = "Unassigned";

            // If backend returns agent object (newer format)
            if (t.agent && typeof t.agent === "object" && t.agent.name) {
              agentName = t.agent.name;
            }

            // If backend returns ONLY agentId string (older format)
            if (typeof t.agent === "string") {
              agentName = agentsMap[t.agent] || "Unassigned";
            }

            return (
              <tr
                key={t._id}
                className="clickable-row"
                onClick={() => handleRowClick(t._id)}
              >
                <td>{t.title || "Untitled"}</td>

                <td className={`status ${t.status?.toLowerCase() || ""}`}>
                  {t.status || "Open"}
                </td>

                <td className={`priority ${t.priority?.toLowerCase() || ""}`}>
                  {t.priority || "N/A"}
                </td>

                {/* ⭐ Display agent name */}
                <td>{agentName}</td>

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
