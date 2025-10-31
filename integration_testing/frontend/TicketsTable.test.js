import { render, screen } from "@testing-library/react";
import TicketsTable from "./TicketsTable";

describe("TicketsTable component", () => {
  test("renders 'no tickets' message when no tickets exist", () => {
    render(<TicketsTable tickets={[]} />);
    expect(screen.getByText(/no tickets/i)).toBeInTheDocument();
  });

  test("renders ticket titles when provided", () => {
    const mockTickets = [
      { ticketId: "T1", title: "Network Issue", status: "Open" },
      { ticketId: "T2", title: "Software Bug", status: "In Progress" },
    ];
    render(<TicketsTable tickets={mockTickets} />);
    expect(screen.getByText("Network Issue")).toBeInTheDocument();
    expect(screen.getByText("Software Bug")).toBeInTheDocument();
  });
});