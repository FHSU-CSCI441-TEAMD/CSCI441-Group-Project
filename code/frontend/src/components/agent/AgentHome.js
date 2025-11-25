import React from 'react';
import AgentNavigationBar from './AgentNavigationBar';
import TicketsTable from '../TicketsTable';
import { useTickets } from '../../TicketsContext';

function AgentHome() {
  const { tickets, currentUser } = useTickets();

  const myAssignedTickets = currentUser
    ? tickets.filter(t => t.agent === currentUser.id)
    : [];

  return (
    <>
      <AgentNavigationBar />
      <TicketsTable tickets={myAssignedTickets} />
    </>
  );
}

export default AgentHome;
