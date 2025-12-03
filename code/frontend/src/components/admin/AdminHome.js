import React, { useEffect } from "react";
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

  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/");
      return;
    }
    fetchTickets();
  }, [currentUser]);

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
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>{t._id}</td>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.agent?.email || "Unassigned"}</td>

                <td>
                  <button
                    className="admin-btn"
                    onClick={() => navigate(`/admin-reassign/${t._id}`)}
                  >
                    Reassign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
