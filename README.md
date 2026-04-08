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
   
