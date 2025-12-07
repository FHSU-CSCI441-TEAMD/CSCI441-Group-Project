// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/TicketsContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

const TicketsCtx = createContext();

export function TicketsProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  // =========================
  //  REFRESH CURRENT USER
  // =========================
  const refreshCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("⚠️ Unauthorized or expired session, logging out user.");
        setCurrentUser(null);
        localStorage.removeItem("user");
        return null;
      }

      const user = await res.json();
      console.log("✅ Current user profile fetched:", user);
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("❌ Error fetching current user:", error);
      setCurrentUser(null);
      return null;
    }
  };

  // =========================
  //  FETCH ALL TICKETS
  // =========================
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      console.log("🎟️ Tickets fetched:", data);
      setTickets(data);
    } catch (err) {
      console.error("❌ fetchTickets error:", err);
    }
  };

  // ============================================================
  //  NEW: Update only ONE ticket in context (local update helper)
  // ============================================================
  const updateTicketInContext = (updatedTicket) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t._id === updatedTicket._id ? updatedTicket : t
      )
    );
  };

  // ============================================================
  //  NEW: Update ticket on backend + update context + refetch
  // ============================================================
  const updateTicket = async (ticketId, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update ticket");

      const updated = await res.json();
      console.log("🔄 Ticket updated:", updated);

      // Update locally
      updateTicketInContext(updated);

      // Optional but recommended: ensure perfect sync
      //fetchTickets();

      return updated;
    } catch (err) {
      console.error("❌ updateTicket error:", err);
      return null;
    }
  };

  // =========================
  //  CREATE TICKET
  // =========================
  const createTicket = async (ticketData) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to create ticket (${res.status})`);

      const savedTicket = await res.json();
      setTickets((prev) => [savedTicket, ...prev]);
      fetchTickets();

      console.log("🧾 Ticket created:", savedTicket);
      return savedTicket;
    } catch (error) {
      console.error("❌ Failed to create ticket:", error);
      return null;
    }
  };

  // =========================
  //  INITIAL LOAD
  // =========================
  useEffect(() => {
    const init = async () => {
      let user = null;

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);

          user = await refreshCurrentUser();
        }
      } catch {}

      if (user) await fetchTickets();
    };

    init();
  }, []);

  // =========================
  //  SYNC LOCALSTORAGE
  // =========================
  useEffect(() => {
    if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser));
    else localStorage.removeItem("user");
  }, [currentUser]);

  // =========================
  //  AUTO-REFRESH TICKETS ON USER CHANGE
  // =========================
  useEffect(() => {
    if (currentUser) {
      console.log("🎟️ User logged in — refreshing tickets...");
      fetchTickets();
    } else {
      console.log("🚪 User logged out — clearing tickets.");
      setTickets([]);
    }
  }, [currentUser]);

  // =========================
  //  PROVIDE CONTEXT
  // =========================
  return (
    <TicketsCtx.Provider
      value={{
        currentUser,
        setCurrentUser,
        refreshCurrentUser,
        tickets,
        setTickets,
        createTicket,
        fetchTickets,
        updateTicket,          
        updateTicketInContext,  
      }}
    >
      {children}
    </TicketsCtx.Provider>
  );
}

export function useTickets() {
  return useContext(TicketsCtx);
}
