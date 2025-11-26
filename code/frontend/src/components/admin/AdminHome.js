import React, { useEffect } from "react";
import { useTickets } from "../../TicketsContext";
import NavigationBar from "../NavigationBar";
import "../NavigationBar.css";
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

      <div className="p-6" style={{ marginTop: "100px" }}>
        <h1 className="text-2xl font-bold mb-4">All Tickets</h1>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Assigned To</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr key={t._id} className="border-b">
                <td className="p-2">{t._id}</td>
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.agent?.email || "Unassigned"}</td>

                <td className="p-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
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