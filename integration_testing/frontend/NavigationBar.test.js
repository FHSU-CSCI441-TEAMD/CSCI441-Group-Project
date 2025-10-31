import { render, screen, fireEvent } from "@testing-library/react";
import NavigationBar from "./NavigationBar";

describe("NavigationBar component", () => {
  test("renders navigation links and logout button", () => {
    render(<NavigationBar />);
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/create/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("clicking logout triggers event handler", () => {
    const mockLogout = jest.fn();
    render(<NavigationBar onLogout={mockLogout} />);
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});