import React from "react";
import { render, screen } from "@testing-library/react";
import TicketUpdate from "./TicketUpdate";
import { TicketsProvider } from "../TicketsContext";
import { BrowserRouter } from "react-router-dom";

beforeEach(() => {
  jest.clearAllMocks();

  global.fetch = jest.fn((url) => {
    console.log("FETCH URL:", url);

    if (url.includes("/tickets/")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          _id: "1",
          title: "Test Ticket",
          status: "Open",
          priority: "Low",
          agent: null,
        }),
      });
    }

    if (url.includes("/agents")) {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
});

test("TicketUpdate component renders heading", async () => {
  render(
    <BrowserRouter>
      <TicketsProvider>
        <TicketUpdate />
      </TicketsProvider>
    </BrowserRouter>
  );

  const heading = await screen.findByText(/edit ticket/i);
  expect(heading).toBeInTheDocument();
});
