import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { TicketsProvider } from './TicketsContext'; // ✅ import your context

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    {/* ✅ Wrap your entire app with the TicketsProvider */}
    <TicketsProvider>
      <App />
    </TicketsProvider>
  </Router>
);
