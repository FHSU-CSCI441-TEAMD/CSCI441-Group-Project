# 🧭 QuickTix Integration Testing Guide

This guide covers **integration tests** for the QuickTix frontend.  
Integration tests verify that **multiple components or data flows** work together correctly.

---

## Purpose

Integration tests ensure that components correctly handle **props, context, and user interactions**.  
They simulate a limited flow of how users interact with multiple UI parts — without a real backend.

---

## Folder Structure

```
src/
 ├── components/
 │    ├── TicketsTable.js
 │    ├── TicketsTable.test.js
 │    ├── NavigationBar.js
 │    ├── NavigationBar.test.js
 │
 ├── setupTests.js
```

---

## Tests Included

| File                      | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| **TicketsTable.test.js**  | Verifies ticket list rendering for mock data and empty states.          |
| **NavigationBar.test.js** | Ensures nav links and logout button render correctly and handle clicks. |

---

## Running Integration Tests

Run all tests:

```bash
npm test
```

Run only integration tests (by filename):

```bash
npm test -- TicketsTable.test
npm test -- NavigationBar.test
```

Or, if stored under a `integration/` folder:

```bash
npm test -- --testPathPattern=integration
```

---

## Viewing Coverage

Generate a code coverage report for integration tests:

```bash
npm test -- --coverage --watchAll=false
```

Then open:

```
coverage/lcov-report/index.html
```

---

## Best Practices

- Focus on **data flow** and **UI behavior**, not visuals.
- Use **mock props** or fake data to simulate backend responses.
- Keep integration tests lightweight — don’t test every detail of unit logic again.
- Prefer **React Testing Library** queries (like `getByRole`, `getByText`) for realistic user behavior.

---

© 2025 QuickTix Project – Integration Testing Documentation
