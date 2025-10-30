# Service (Ticketing) Management System - CSCI 441

This is the main repository for the CSCI 441 (Software Engineering) group project by Team D. The project is a full-stack Service (Ticketing) Management System designed to handle IT support requests within an organization.

## Live Links

* **Frontend (Vercel):** [https://quicktix-weld.vercel.app/](https://quicktix-weld.vercel.app/)
* **Backend (Render):** [https://csci441-group-project.onrender.com/](https://csci441-group-project.onrender.com/)

---

## About This Project

This application provides a centralized platform for an organization's employees (**Customers**) to submit support tickets, for **Agents** to manage and resolve those tickets, and for **Admins** to oversee the entire system, manage users, and view reports.

The backend is a secure, role-based REST API, and the frontend is a responsive single-page application (SPA) that consumes it.

---

## Tech Stack

This project is built using the **MERN stack** and other modern technologies:

* **Frontend:**
    * **React**
    * **Vite** (Build Tool)
    * **Tailwind CSS** (Styling)

* **Backend:**
    * **Node.js** (Runtime)
    * **Express.js** (Server Framework)
    * **MongoDB** (with Mongoose) (Database)
    * **JSON Web Tokens (JWT)** (Authentication)
    * **SendGrid** (Email Notifications)

* **Deployment:**
    * Frontend deployed on **Vercel**.
    * Backend deployed on **Render**.

---

## Project Submission Structure

This repository is organized according to the course submission requirements.

* `code/`: Contains the complete source code for both the `frontend` and `backend` applications.
* `unit_testing/`: Contains all unit test files for the backend.
* `integration_testing/`: Contains all API integration test files for the backend.
* `data_collection/`: Contains the `seeder.js` script used to populate the database with the first admin.
* `documentation/`: Contains all required PDF project documentation (User Manual, Technical Docs, etc.).

---

## How to Run Locally

For complete instructions on how to install, configure (set up `.env` files), and run both the frontend and backend servers locally, please see the detailed guide in the code directory:

**[code/README1.md](./code/README1.md)**