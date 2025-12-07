==================================================
PROJECT: Data Collection (Seeder) Script (README4.md)
==================================================

This document explains how to run the data collection (seeder) script for the backend.

## 1. Purpose

The purpose of this script is to populate a new, empty database with the initial required data. Specifically, it creates the **first 'Admin' user account**.

This solves the "chicken-and-egg" problem of how to create the first admin when the "create user" endpoint is itself an admin-only feature.

## 2. Prerequisites

1.  **Install Dependencies:** Ensure you have installed all backend dependencies:
    ```bash
    cd code/backend
    npm install
    ```
2.  **Configure `.env` File:** The script collects the new admin's data and the database URI from the `code/backend/.env` file. Ensure these variables are set:
    * `MONGO_URI` (Must point to your main development or production database)
    * `ADMIN_NAME`
    * `ADMIN_EMAIL`
    * `ADMIN_PASSWORD`

## 3. Script Configuration (in `package.json`)

To run the seeder script (located in `data_collection/`) from the `code/backend/` directory, the `package.json` file in `code/backend/` **must** contain the following "seed" script:

```json
"scripts": {
  "seed": "node ../../data_collection/seeder.js"
}

## 4. How to Run the Script

This script should only be run **ONCE** per new database. It is designed to check if an admin already exists and will skip if one is found.

1.  Open a terminal and navigate to the **`code/backend`** directory:
    ```bash
    cd code/backend
    ```
2.  Run the seed script:
    ```bash
    npm run seed
    ```

The script will connect to your database, create the admin user, and print a confirmation message.