==================================================
PROJECT: Unit Testing (README2.md)
==================================================

This document explains how to run the unit tests for the backend application.

## 1. Purpose

The unit tests are designed to check individual pieces of logic in isolation. They use the **Jest** framework and mocking to test model methods and middleware functions without making real database or network calls.

## 2. Prerequisites

1.  **Install Dependencies:** All testing dependencies (like `jest`) are listed in the main backend `package.json` file. You must first install them by navigating to the `code/backend` directory and running:
    ```bash
    npm install
    ```
2.  **Configure Scripts:** The `package.json` file located in `code/backend` must contain the following script in its "scripts" section:
    ```json
    "test:unit": "jest ../../unit_testing/backend/"
    ```

## 3. How to Run Unit Tests

All unit tests will be run from the main backend code directory.

1.  Open a terminal and navigate to the `code/backend` directory:
    ```bash
    cd code/backend
    ```
2.  Run the unit test script:
    ```bash
    npm run test:unit
    ```

Jest will automatically discover and run all `.test.js` files located in the `unit_testing/backend/` directory.