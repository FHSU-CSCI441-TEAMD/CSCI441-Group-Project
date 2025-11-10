import React, { useContext, useMemo } from "react";
import { TicketsContext } from "../context/TicketsContext";
import "./MyTicketsSummary.css";

function MyTicketsSummary() {
  const { tickets } = useContext(TicketsContext);

  // Compute counts only when tickets change
  const { open, inProgress, resolved, closed } = useMemo(() => {
    if (!tickets || tickets.length === 0)
      return { open: "N/A", inProgress: "N/A", resolved: "N/A" };

    const counts = {
      open: tickets.filter((t) => t.status?.toLowerCase() === "open").length || "N/A",
      inProgress:
        tickets.filter((t) => t.status?.toLowerCase() === "in progress").length || "N/A",
      resolved:
        tickets.filter((t) => t.status?.toLowerCase() === "resolved").length || "N/A",
    };

    return counts;
  }, [tickets]);

  return (
    <div className="topRow">
      <h2>My Tickets Summary</h2>
      <div className="paragraphRow">
        <p className="open">Open: {open}</p>
        <p className="inProgress">In Progress: {inProgress}</p>
        <p className="resolved">Resolved: {resolved}</p>
      </div>
    </div>
  );
}

export default MyTicketsSummary;