import React, { useEffect, useState } from "react";
import NavigationBar from "../NavigationBar";
import { useTickets } from "../../TicketsContext";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://csci441-group-project.onrender.com"
    : "http://localhost:5000";

export default function AdminReports() {
  const { currentUser } = useTickets();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/");
      return;
    }
    loadReport();
  }, [currentUser]);

  const loadReport = async () => {
    const res = await fetch(`${API_BASE}/api/reports/tickets`, {
      credentials: "include",
    });
    const data = await res.json();
    setReport(data);
  };

  if (!report) {
    return (
      <div>
        <NavigationBar />
        <div style={{ marginTop: "100px", padding: "20px" }}>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  // =========================
  // 1. PIE CHART DATA (status)
  // =========================
  const statusData = [
    { name: "Open", value: report.openTickets },
    { name: "In Progress", value: report.inProgressTickets },
    { name: "Closed", value: report.closedTickets },
  ];

  const COLORS = ["#0088FE", "#FFBB28", "#00C49F"];

  // ============================
  // 2. BAR CHART DATA (per agent)
  // ============================
  const agentData = report.agentTicketCounts || [];

  // =====================================
  // 3. LINE CHART DATA (tickets per date)
  // =====================================
  const timelineData = report.ticketsPerDay || [];

  return (
    <div>
      <NavigationBar />

      <div style={{ marginTop: "100px", padding: "20px" }}>
        <h1 className="text-2xl font-bold mb-4">Admin Ticket Report</h1>

        {/* ===================== */}
        {/* Status Pie Chart */}
        {/* ===================== */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Ticket Status Breakdown</h2>
        <PieChart width={420} height={320}>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        {/* ===================== */}
        {/* Agent Bar Chart */}
        {/* ===================== */}
        <h2 className="text-xl font-semibold mt-12 mb-2">Tickets Per Agent</h2>
        <BarChart width={600} height={350} data={agentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="agentEmail" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tickets" fill="#8884d8" />
        </BarChart>

        {/* ===================== */}
        {/* Timeline Line Chart */}
        {/* ===================== */}
        <h2 className="text-xl font-semibold mt-12 mb-2">Tickets Over Time</h2>
        <LineChart width={650} height={350} data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tickets" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
}
