import { render, screen, fireEvent } from "@testing-library/react";
import CreateTicket from "./CreateTicket";

describe("CreateTicket component", () => {
  test("renders ticket creation form fields", () => {
    render(<CreateTicket />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description|issue/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("prevents submission when required fields are empty", () => {
    render(<CreateTicket />);
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);
    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });
});