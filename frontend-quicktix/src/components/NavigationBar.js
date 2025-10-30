// src/components/NavigationBar.js
import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import logo from "./assets/logo.png";
import { useTickets } from "../TicketsContext";
import React from "react";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function NavigationBar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setTickets } = useTickets(); // ✅ added setTickets

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      // ✅ Ask backend to clear JWT cookie
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("⚠️ Backend logout returned non-OK:", response.status);
      }

      // ✅ Clear local storage + context
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setTickets([]); // ✅ instantly clears the table

      // ✅ Redirect to login
      navigate("/");
      console.log("✅ User logged out successfully.");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even if backend fails, clear local state to stay safe
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setTickets([]);
      navigate("/");
    }
  };

  // ✅ Show user's full name when logged in
  const displayName = currentUser?.name || currentUser?.email || "";

  return (
    <div className="Wrapper">
      <header className="left">
        <h1>
          <Link to="/home" className="logoName">
            QuickTix
          </Link>
        </h1>
        <Link to="/home">
          <img src={logo} alt="QuickTix Logo" className="logo" />
        </Link>
      </header>

      <nav className="right">
        <ul>
          <li>
            <Link to="/create-new-ticket">Create New Ticket</Link>
          </li>
          <li>
            <Link to="/contact-us">Contact Us</Link>
          </li>

          {/* ✅ Display user's name */}
          {displayName && (
            <li className="userName">
              Hello,&nbsp;<strong>{displayName}</strong>
            </li>
          )}

          <li>
            <button
              onClick={handleLogout}
              className="navLink logoutButton"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default NavigationBar;
