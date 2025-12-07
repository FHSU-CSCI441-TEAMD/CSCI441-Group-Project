// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
// src/components/admin/AdminHome.js
import React, { useEffect, useMemo, useState } from "react";
import { useTickets } from "../../TicketsContext";
import NavigationBar from "../NavigationBar";
import "../NavigationBar.css";
import "./AdminHome.css";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function AdminHome() {
  const { currentUser, tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/");
      return;
    }

    // Always refresh ticket list
    fetchTickets();

    // Load all users since backend does NOT populate agent field
    const loadUsers = async () => {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    };

    loadUsers();
  }, [currentUser?._id]);

  // Build map of agentId → agent details
  const agentMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  return (
    <div>
      <NavigationBar />

      <div className="admin-container">
        <h1 className="admin-title">All Tickets</h1>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => {
              // Lookup agent object using agent ID from backend
              const agent = agentMap[t.agent];

              return (
                <tr
                  key={t._id}
                  onClick={() => navigate(`/ticket/${t._id}`)}
                >
                  <td>{t._id}</td>
                  <td>{t.title}</td>
                  <td>{t.status}</td>

                  <td>
                    {agent
                      ? `${agent.name} (${agent.email})`
                      : "Unassigned"}
                  </td>

                  <td>
                    <button
                      className="admin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin-reassign/${t._id}`);
                      }}
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
