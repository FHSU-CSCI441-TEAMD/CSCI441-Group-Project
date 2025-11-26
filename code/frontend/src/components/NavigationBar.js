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
  const { currentUser, setCurrentUser, setTickets } = useTickets();

  // -----------------------------------------------------
  // Determine user home route based on role
  // -----------------------------------------------------
  const homeRoute =
    currentUser?.role === "Admin"
      ? "/admin-home"
      : currentUser?.role === "Agent"
      ? "/agent-home"
      : currentUser
      ? "/home"
      : "/";

  // -----------------------------------------------------
  // Logout handler
  // -----------------------------------------------------
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
        {/* Logo + App Name */}
        <h1>
          <Link to={homeRoute} className="logoName">
            QuickTix
          </Link>
        </h1>

        <Link to={homeRoute}>
          <img src={logo} alt="QuickTix Logo" className="logo" />
        </Link>
      </header>

      <nav className="right">
        <ul>
          {/* -------------------------------------------------
             ADMIN LINKS
          ------------------------------------------------- */}
          {currentUser?.role === "Admin" && (
            <>
              <li><Link to="/admin-home">Admin Dashboard</Link></li>
              <li><Link to="/admin-reports">Reports</Link></li>
            </>
          )}

          {/* -------------------------------------------------
             AGENT LINKS
          ------------------------------------------------- */}
          {currentUser?.role === "Agent" && (
            <li><Link to="/agent-home">Agent Home</Link></li>
          )}

          {/* -------------------------------------------------
             CUSTOMER LINKS
          ------------------------------------------------- */}
          {currentUser?.role === "Customer" && (
            <>
              <li><Link to="/create-new-ticket">Create New Ticket</Link></li>
            </>
          )}

          {/* -------------------------------------------------
             SHARED LINKS
          ------------------------------------------------- */}
          <li><Link to="/update-profile">Update Profile</Link></li>

          {displayName && (
            <li className="userName">
              Hello, <strong>{displayName}</strong>
            </li>
          )}

          {/* -------------------------------------------------
             LOGOUT BUTTON
          ------------------------------------------------- */}
          <li>
            <button
              onClick={handleLogout}
              className="navLink logoutButton"
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
