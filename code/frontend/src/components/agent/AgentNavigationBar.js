// src/components/NavigationBar.js
import { Link, useNavigate } from "react-router-dom";
import "./AgentNavigationBar.css";
import logo from "../assets/logo.png";
import { useTickets } from "../../TicketsContext";
import React from "react";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function AgentNavigationBar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setTickets } = useTickets();

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setTickets([]);
    navigate("/");
  };

  const displayName = currentUser?.name || currentUser?.email || "";

  return (
    <div className="Wrapper">
      <header className="left">
        <h1>
          <Link to="/agent-home" className="logoName">
            QuickTix
          </Link>
        </h1>
        <Link to="/agent-home">
          <img src={logo} alt="QuickTix Logo" className="logo" />
        </Link>
      </header>

      <nav className="right">
        <ul>
          {/* AGENT LINKS */}
          {currentUser?.role === "Agent" && (
            <li><Link to="/agent-home">Agent Home</Link></li>
          )}

          <li><Link to="/update-profile">Update Profile</Link></li>

          {displayName && (
            <li className="userName">
              Hello, <strong>{displayName}</strong>
            </li>
          )}

          <li>
            <button
              onClick={handleLogout}
              className="logoutButton"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AgentNavigationBar;