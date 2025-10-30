import { render, screen, fireEvent } from "@testing-library/react";
import Login from "./Login";

describe("Login component", () => {
  test("renders email, password, and login button", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("does not submit when fields are empty", () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);
    expect(screen.queryByText(/invalid|required/i)).not.toBeNull();
  });
});