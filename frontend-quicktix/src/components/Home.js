import React from 'react';
// src/components/Home.js
import NavigationBar from './NavigationBar';
import MyTicketsSummary from './MyTicketsSummary';
import TicketsTable from './TicketsTable';
import CreateNewTicketBtn from './CreateNewTicketBtn';
import { useTickets } from '../TicketsContext';

function Home() {
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
      <CreateNewTicketBtn />
    </>
  );    
}

export default Home;
