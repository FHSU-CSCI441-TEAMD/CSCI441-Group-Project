// src/App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Ticket from './components/Ticket';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { TicketsProvider } from './TicketsContext';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import UpdateProfile from './components/UpdateProfile';
import AgentHome from './components/AgentHome';
import TicketDetails from "./components/TicketDetails";
import AdminHome from "./components/admin/AdminHome";
import AdminReports from "./components/admin/AdminReports";
import AdminReassignTicket from "./components/admin/AdminReassignTicket";


function App() {
  return (
    <div className="App">
      <TicketsProvider> {/* 👈 wrap all routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-new-ticket" element={<Ticket />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/agent-home" element={<AgentHome />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
          <Route path="/admin-home" element={<AdminHome />} />
<Route path="/admin-reports" element={<AdminReports />} />
<Route path="/admin-reassign/:id" element={<AdminReassignTicket />} />
        </Routes>
      </TicketsProvider>
    </div>
  );
}


export default App;
