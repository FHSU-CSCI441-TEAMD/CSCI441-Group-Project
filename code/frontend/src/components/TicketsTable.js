// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/components/TicketsTable.js
import React from "react";
import { useTickets } from "../TicketsContext";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";

function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, currentUser } = useTickets();
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

  // 🔹 NEW: Normalize agent display (object | string | null)
  const getAgentDisplay = (agent) => {
    if (!agent) return "Unassigned";

    // If backend populates agent with { name, email, _id }
    if (typeof agent === "object") {
      return agent.name || agent.email || "Unassigned";
    }

    // If backend returns string agentId
    if (typeof agent === "string") {
      return agent; // tests expect raw string
    }

    return "Unassigned";
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

                {/* 🔹 NEW: Proper safe agent display */}
                <td>{getAgentDisplay(t.agent)}</td>

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

export default TicketsTable;
