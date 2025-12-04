// src/components/TicketsTable.js
import React, { useEffect, useState } from "react";
import { useTickets } from "../TicketsContext";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function TicketsTable({ tickets: propTickets }) {
  const { tickets: contextTickets, currentUser } = useTickets();
  const baseTickets = propTickets || contextTickets || [];
  const navigate = useNavigate();

  // We'll keep a local "enriched" copy of tickets where agent is populated
  const [displayTickets, setDisplayTickets] = useState(baseTickets);

  // Whenever the base tickets change, refresh our local copy
  useEffect(() => {
    setDisplayTickets(baseTickets);

    // For tickets where agent is just an ID string, fetch full details
    const enrichTickets = async () => {
      try {
        const updated = await Promise.all(
          baseTickets.map(async (t) => {
            // If agent is already an object (from somewhere else), keep as-is
            if (t.agent && typeof t.agent === "object") {
              return t;
            }

            // If no agent, nothing to enrich
            if (!t.agent || typeof t.agent !== "string") {
              return t;
            }

            // Fetch single ticket with populated agent
            try {
              const res = await fetch(`${API_BASE}/api/tickets/${t._id}`, {
                credentials: "include",
              });

              if (!res.ok) {
                // If the request fails, just fall back to original ticket
                return t;
              }

              const fullTicket = await res.json();
              return fullTicket; // has agent: { name, email, _id }
            } catch (err) {
              console.error("Failed to enrich ticket", t._id, err);
              return t;
            }
          })
        );

        setDisplayTickets(updated);
      } catch (err) {
        console.error("Error enriching tickets:", err);
      }
    };

    // Run enrichment for everyone (Admin / Agent / Customer),
    // since the /api/tickets/:id route is allowed for all roles.
    if (baseTickets.length > 0) {
      enrichTickets();
    }
  }, [baseTickets]);

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

  if (!displayTickets.length) {
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
          {displayTickets.map((t) => {
            const created = formatDate(t.createdAt);
            const updated =
              t.updatedAt && t.updatedAt !== t.createdAt
                ? formatDate(t.updatedAt)
                : "—";

            // Agent can now be an object (from enrich step) or an ID/null
            let agentLabel = "Unassigned";
            if (t.agent && typeof t.agent === "object") {
              // populated by /api/tickets/:id
              const name = t.agent.name || t.agent.email || "Unknown";
              const email = t.agent.email;
              agentLabel = email ? `${name} (${email})` : name;
            } else if (t.agent) {
              // We only have an ID string, but no name/email
              agentLabel = "Assigned";
            }

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

                <td>{agentLabel}</td>

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
