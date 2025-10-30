import { makeTicketId } from "./makeTicketId";

describe("makeTicketId utility", () => {
  test("returns a string starting with 'TIX-'", () => {
    const id = makeTicketId();
    expect(typeof id).toBe("string");
    expect(id.startsWith("TIX-")).toBe(true);
  });

  test("produces unique IDs on multiple calls", () => {
    const ids = new Set();
    for (let i = 0; i < 5; i++) {
      ids.add(makeTicketId());
    }
    expect(ids.size).toBe(5);
  });
});