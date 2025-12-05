// src/components/NavigationBar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import logo from "./assets/logo.png";
import { useTickets } from "../TicketsContext";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

function NavigationBar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setTickets } = useTickets();

  // Determine user home route based on role
  const homeRoute =
    currentUser?.role === "Admin"
      ? "/admin-reports"
      : currentUser?.role === "Agent"
      ? "/agent-home"
      : currentUser
      ? "/home"
      : "/";

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
      {/* Left: Logo + Brand */}
      <header className="left">
        <h1>
          <Link to={homeRoute} className="logoName">
            QuickTix
          </Link>
        </h1>

        <Link to={homeRoute}>
          <img src={logo} alt="QuickTix Logo" className="logo" />
        </Link>
      </header>

      {/* Right: Navigation Links */}
      <nav className="right">
        <ul>
          {/* Admin links */}
          {currentUser?.role === "Admin" && (
            <>
              <li>
                <Link className="navItem" to="/admin-home">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link className="navItem" to="/admin-reports">
                  Reports
                </Link>
              </li>
              <li>
                <Link className="navItem" to="/create-new-ticket">
                  Create New Ticket
                </Link>
              </li>  
            </>
          )}

          {/* Agent links */}
          {currentUser?.role === "Agent" && (
            <li>
              <Link className="navItem" to="/agent-home">
                Agent Home
              </Link>
            </li>
          )}

          {/* Customer links */}
          {currentUser?.role === "Customer" && (
            <li>
              <Link className="navItem" to="/create-new-ticket">
                Create New Ticket
              </Link>
            </li>
          )}

          {/* Shared link */}
          <li>
            <Link className="navItem" to="/update-profile">
              Update Profile
            </Link>
          </li>

          {/* User greeting */}
          {displayName && (
            <li className="userName">
              Hello, <strong>{displayName}</strong>
            </li>
          )}

          {/* Logout button, styled like a link */}
          <li>
            <button onClick={handleLogout} className="navItem logoutButton">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default NavigationBar;
