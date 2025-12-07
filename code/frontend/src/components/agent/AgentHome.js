// written by: Gregory Hall
// tested by: Gregory Hall
// debugged by: Gregory Hall
import React from 'react';
import NavigationBar from '../NavigationBar';
import TicketsTable from '../TicketsTable';
import MyTicketsSummary from '../MyTicketsSummary';
import { useTickets } from '../../TicketsContext';

function AgentHome() {
  const { tickets, currentUser } = useTickets();

  // Filter tickets for the logged-in user
  const myTickets = currentUser
    ? tickets.filter(t => t.userId === currentUser.id)
    : [];

  return (
    <>
      <NavigationBar />
      <MyTicketsSummary />
      <TicketsTable tickets={myTickets} />
    </>
  );
}

export default AgentHome;
