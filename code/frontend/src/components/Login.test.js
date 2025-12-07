import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

// Full mock of useTickets so Login never errors
jest.mock("../TicketsContext", () => ({
  useTickets: () => ({
    setCurrentUser: jest.fn(),
    refreshCurrentUser: jest.fn(),
    fetchTickets: jest.fn(),
  }),
}));

test("Login component renders correctly", () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});
