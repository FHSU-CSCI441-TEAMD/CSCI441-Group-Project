// src/components/TicketsTable.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import TicketsTable from "./TicketsTable";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../TicketsContext", () => ({
  useTickets: () => ({
    currentUser: { name: "Test User", role: "Customer" },
  }),
}));

describe("TicketsTable", () => {
  test("renders rows and agent info", () => {
    const tickets = [
      {
        _id: "1",
        title: "Ticket 1",
        status: "Open",
        priority: "Low",
        agent: "John Smith",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "2",
        title: "Ticket 2",
        status: "In Progress",
        priority: "High",
        agent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <MemoryRouter>
        <TicketsTable tickets={tickets} />
      </MemoryRouter>
    );

    expect(screen.getByText("Ticket 1")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  test("clicking row navigates", () => {
    const tickets = [
      {
        _id: "123",
        title: "Clickable",
        status: "Open",
        priority: "Low",
        agent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <MemoryRouter>
        <TicketsTable tickets={tickets} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Clickable").closest("tr"));

    expect(mockNavigate).toHaveBeenCalledWith("/ticket/123");
  });
});
