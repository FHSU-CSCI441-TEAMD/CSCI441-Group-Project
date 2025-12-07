// src/components/CreateTicket.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTicket from "./CreateTicket";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Prevent jsdom alert failure
beforeEach(() => {
  window.alert = jest.fn();
});

// Mock TicketsContext
jest.mock("../TicketsContext", () => ({
  useTickets: () => ({
    currentUser: { _id: "123", name: "John Doe" },
    refreshCurrentUser: jest.fn().mockResolvedValue({ _id: "123" }),
    fetchTickets: jest.fn(),
    createTicket: jest.fn().mockResolvedValue({ _id: "abc123" }), // success
  }),
}));

describe("CreateTicket Component", () => {
  test("submits when the form is valid and navigates home", async () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title\*/i), {
      target: { value: "Broken Laptop" },
    });

    fireEvent.change(screen.getByLabelText(/description of issue\*/i), {
      target: { value: "It does not turn on." },
    });

    fireEvent.click(screen.getByLabelText(/medium/i)); // radio button

    fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/home")
    );
  });
});
