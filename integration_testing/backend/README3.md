==================================================
PROJECT: Integration Testing (README3.md)
==================================================

This document explains how to run the integration tests for the backend API.

## 1. Purpose

The integration tests use **Jest** and **Supertest** to launch the actual application and send real HTTP requests to the API endpoints. This tests the full request/response cycle, including routes, controllers, middleware, and database interaction.

## 2. Prerequisites

1.  **Install Dependencies:** All testing dependencies (like `jest` and `supertest`) are listed in the `code/backend/package.json` file. You must first install them:
    ```bash
    cd code/backend
    npm install
    ```
2.  **Configure Test Database:**
    **This is a critical step.** These tests will connect to a MongoDB database. To avoid deleting your development data, you **must** use a separate, empty test database.
    * Create a new, separate cluster or database in MongoDB Atlas.
    * Get the connection string for this **test database**.
    * Open the `.env` file in the `code/backend` directory and add this new variable:
        ```dotenv
        MONGO_URI_TEST=your-test-database-connection-string
        ```

3.  **Configure Scripts:** The `package.json` file located in `code/backend` must contain the following script:
    ```json
    "test:integration": "jest ../../integration_testing/backend/"
    ```

## 3. How to Run Integration Tests

**Important:** Do **NOT** run the main server (`npm run dev`) while testing. The test suite will start and stop its own server instance automatically.

1.  Open a terminal and navigate to the `code/backend` directory:
    ```bash
    cd code/backend
    ```
2.  Run the integration test script:
    ```bash
    npm run test:integration
    ```

Jest will discover and run all integration test files from the `integration_testing/backend/` directory.