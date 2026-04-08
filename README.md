# 📦 Warehouse Package System

A full-stack web application designed to manage inventory and monitor storage capacity in real-time. This system tracks packages categorized by size (Small, Medium, and Large) and strictly enforces fixed maximum capacity limits for each category to prevent overfilling. 

Built with **React**, **Node.js**, **Express**, and **MySQL**, this project heavily emphasizes data integrity and concurrency management, utilizing database transactions and row-level locking to prevent race conditions during high-traffic package intake.

---

## ✨ Key Features

* **Real-Time Capacity Dashboard:** Automatically calculates and displays the maximum limit, current usage, and available space for each specific package size.
* **Smart Package Intake:** Allows users to add incoming packages, but actively rejects the operation if that specific size category is full.
* **Space Reclamation:** Users can remove a package by its ID, instantly freeing up the capacity limits for new deliveries.
* **Concurrency Safe:** Utilizes MySQL transactions and row-level locking (`FOR UPDATE`) to guarantee that simultaneous package scans do not bypass capacity limits.
* **Auto-Initializing Database:** The backend automatically generates the required MySQL tables and seeds the initial capacity data upon the first server startup.

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using `mysql2/promise` for connection pooling)
* **Deployment:** Render (Backend API & Static Frontend)

---

## 🚀 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* A local or cloud [MySQL](https://www.mysql.com/) database running

### 1. Backend Setup
1. Open a terminal and navigate to your backend directory.
2. Install dependencies:
   ```bash
   npm install express cors mysql2
   ```
3. Set up your environment variables. You can create a .env file or export them directly in your terminal:
* DB_HOST (e.g., localhost)
* DB_USER (e.g., root)
* DB_PASSWORD (your MySQL password)
* DB_NAME (e.g., warehouse_system)
* PORT (defaults to 4000)

4. Start the server:
   ```bash
   node server.js
   ```
Note: The server will automatically create the required warehouse_capacity and packages tables and seed the initial limits if they do not exist.

### 2. Frontend Setup
1. Open a separate terminal and navigate to your React frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to http://localhost:3000 (or the port specified by your bundler).

# 📡 API Endpoints

| Method | Endpoint              | Description                                                                 | Body / Params                  |
|--------|-----------------------|-----------------------------------------------------------------------------|--------------------------------|
| GET    | `/api/capacity`       | Fetches total capacity, current count, and available space for all sizes.   | None                           |
| GET    | `/api/packages`       | Fetches a chronological list of all stored packages.                        | None                           |
| POST   | `/api/packages`       | Attempts to add a new package. Rejects if the size capacity is full.        | `{ "size_type": "Small" }`     |
| DELETE | `/api/packages/:id`   | Removes a specific package by ID and frees up space.                        | `id` in URL params             |

