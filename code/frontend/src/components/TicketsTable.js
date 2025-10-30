// src/components/TicketsTable.js
import React from "react";
import { useTickets } from "../TicketsContext";
import "./TicketsTable.css";

function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, currentUser } = useTickets();
  const tickets = propTickets || contextTickets || [];

  // Format dates nicely
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
            // Prevent showing identical Created/Updated times unless actually changed
            const created = formatDate(t.createdAt);
            const updated =
              t.updatedAt && t.updatedAt !== t.createdAt
                ? formatDate(t.updatedAt)
                : "—";

            return (
              <tr key={t._id || t.id}>
                <td>{t.title || "Untitled"}</td>
                <td className={`status ${t.status?.toLowerCase() || ""}`}>
                  {t.status || "Open"}
                </td>
                <td className={`priority ${t.priority?.toLowerCase() || ""}`}>
                  {t.priority || "N/A"}
                </td>
                <td>
                  {t.agent && t.agent.name
                    ? t.agent.name
                    : t.agent
                    ? t.agent
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
