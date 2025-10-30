// src/App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Ticket from './components/Ticket';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { TicketsProvider } from './TicketsContext'; // 👈 add this

function App() {
  return (
    <div className="App">
      <TicketsProvider> {/* 👈 wrap all routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-new-ticket" element={<Ticket />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
      </TicketsProvider>
    </div>
  );
}

export default App;
