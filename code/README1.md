==================================================
PROJECT: Service (Ticketing) Management System
COURSE: CSCI 441 - Team D
==================================================

This document explains how to install and run the full-stack Service (Ticketing) Management System locally. The project consists of a React frontend and an Express.js backend API.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:
* **Node.js and npm:** Required to run JavaScript code and manage dependencies. Download from [https://nodejs.org/](https://nodejs.org/).
* **Git:** Required for cloning the repository. Download from [https://git-scm.com/](https://git-scm.com/).
* **MongoDB Atlas Account:** A free account is needed for the database. Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
* **SendGrid Account:** A free account is needed for sending notification emails. Sign up at [https://sendgrid.com/](https://sendgrid.com/). You must also complete "Single Sender Verification" for an email address you own.

## 2. Installation

1.  **Clone the Repository:** If you haven't already, clone the project repository to your local machine.
2.  **Navigate to Code Directory:** Open your terminal and navigate into the `code` directory of this submission.
3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```
4.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## 3. Configuration (.env Files)

This project requires two `.env` files (one for backend, one for frontend) to store sensitive information and configuration settings. **You must create these files and provide your own values.**

### Backend Configuration (`code/backend/.env`)

Create a file named `.env` inside the `code/backend` directory. Populate it with the following variables, replacing placeholders with your actual credentials:

```dotenv
# --- MongoDB ---
# REQUIRED: Your connection string from MongoDB Atlas.
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster_address>...

# --- JSON Web Token (JWT) ---
# REQUIRED: A long, random, secure string (like a strong password).
JWT_SECRET=your_jwt_secret_string

# --- Server ---
# Optional: Port for the backend server (defaults to 5000 if not set).
PORT=5000

# --- Frontend URL ---
# REQUIRED for CORS: The URL your frontend runs on locally.
CLIENT_URL=http://localhost:3000

# --- Email Service (SendGrid) ---
# REQUIRED: Your SendGrid SMTP credentials and verified sender email.
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=YOUR_SENDGRID_API_KEY
EMAIL_FROM=your_verified_sender_email@example.com

# --- Admin Seeder Script ---
# Optional: Credentials for the first admin created by the seed script.
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=strongpassword123

# --- Node Environment ---
# Should be 'development' for local testing.
NODE_ENV=development

### Frontend Configuration (`code/frontend/.env`)

Create a file named .env inside the code/frontend directory.

# REQUIRED: The URL where your backend API is running locally.
VITE_API_URL=http://localhost:5000

## 4. How to Run the Code Locally

**Important:** Ensure you have completed the Installation and Configuration steps first. You will need **two separate terminal windows** open. Start all commands from the root directory containing the `code` folder.

### Step 4.1: Seed the Database (One-Time Setup)

This script creates the first 'Admin' account using the credentials from `code/backend/.env`. You only need to run this **ONCE** per new database setup.

1.  Open your first terminal.
2.  Navigate to the backend directory:
    ```bash
    cd code/backend
    ```
3.  Run the seed command:
    ```bash
    npm run seed
    ```
    (Wait for the confirmation message, then stay in this directory for the next step.)

### Step 4.2: Run the Backend Server

1.  In the **first terminal** (still in `code/backend`), start the backend server:
    ```bash
    npm run dev
    ```
    (Wait until you see messages indicating the server is running and connected to MongoDB, likely on port 5000.)

### Step 4.3: Run the Frontend Server

1.  Open a **second terminal window**.
2.  Navigate to the frontend directory:
    ```bash
    cd code/frontend
    ```
3.  Start the frontend development server:
    ```bash
s   npm start
    ```
    (Wait until you see a message indicating the server is running, usually providing a URL like `http://localhost:3000`)

### Step 4.4: Access the Application

Open the URL provided by the frontend server (e.g., `http://localhost:3000`) in your web browser to view and interact with the application.