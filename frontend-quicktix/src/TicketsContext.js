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

  // ✅ Get current user profile using cookie-based auth
  const refreshCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "GET",
        credentials: "include", // 👈 ensures cookies are sent
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

  // ✅ Fetch tickets for the current user
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      console.log("🎟️ Tickets fetched from backend:", data);
      setTickets(data);
    } catch (err) {
      console.error("❌ fetchTickets error:", err);
    }
  };

  // ✅ Create ticket (cookie-based authentication)
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

      // Instantly display the new ticket
      setTickets((prev) => [savedTicket, ...prev]);

      // Re-fetch to ensure backend sync
      await fetchTickets();

      console.log("🧾 Ticket created successfully:", savedTicket);
      return savedTicket;
    } catch (error) {
      console.error("❌ Failed to create ticket:", error);
      return null;
    }
  };

  // ✅ Load stored user and tickets on app start
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch {
        /* ignore corrupted data */
      }

      const user = await refreshCurrentUser();
      if (user) await fetchTickets();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Keep user synced in localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser));
    else localStorage.removeItem("user");
  }, [currentUser]);

  // ✅ NEW: Auto-refresh tickets when user logs in or logs out
  useEffect(() => {
    const syncTickets = async () => {
      if (currentUser) {
        console.log("🎟️ User logged in — refreshing tickets...");
        await fetchTickets();
      } else {
        console.log("🚪 User logged out — clearing tickets.");
        setTickets([]);
      }
    };
    syncTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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
      }}
    >
      {children}
    </TicketsCtx.Provider>
  );
}

export function useTickets() {
  return useContext(TicketsCtx);
}
