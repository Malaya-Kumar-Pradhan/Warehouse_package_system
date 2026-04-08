const express = require('express');
const cors = require('cors');
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());
app.use(cors());

// 1. Setup MySQL Connection Pool

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const warehouseTable = `
CREATE TABLE IF NOT EXISTS Warehouse_Capacity (
    size_type VARCHAR(10) PRIMARY KEY, -- 'Small', 'Medium', 'Large'
    max_capacity INT NOT NULL
);
`
pool.query(warehouseTable)

const insertCapacity = `
INSERT INTO Warehouse_Capacity (size_type, max_capacity) 
VALUES ('Small', 100), ('Medium', 50), ('Large', 20);
`
pool.query(insertCapacity)

const packagesTable = `
CREATE TABLE IF NOT EXISTS Packages (
    package_id SERIAL PRIMARY KEY,
    size_type VARCHAR(10) REFERENCES Warehouse_Capacity(size_type),
    stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`
pool.query(packagesTable)

// 2. View Capacity
app.get("/api/capacity", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.size_type, 
        c.max_capacity, 
        COUNT(p.package_id) AS current_count,
        (c.max_capacity - COUNT(p.package_id)) AS available_space
      FROM warehouse_capacity c
      LEFT JOIN packages p ON c.size_type = p.size_type
      GROUP BY c.size_type, c.max_capacity;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Capacity query failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Add Package (Updated for MySQL Transactions)
app.post('/api/packages', async (req, res) => {
    const { size_type } = req.body;
    let connection;

    try {
        // Grab a dedicated connection from the pool for the transaction
        connection = await pool.getConnection(); 
        await connection.beginTransaction();

        // Check capacity. MySQL uses "FOR UPDATE" to lock rows and prevent race conditions.
        const capacityQuery = `
            SELECT 
                c.max_capacity, 
                (SELECT COUNT(*) FROM packages WHERE size_type = ?) as current_count
            FROM warehouse_capacity c 
            WHERE c.size_type = ? FOR UPDATE;
        `;
        const [rows] = await connection.query(capacityQuery, [size_type, size_type]);
        
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Invalid size type" });
        }

        const row = rows[0];

        // Check if space is available
        if (row.current_count >= row.max_capacity) {
            await connection.rollback();
            return res.status(400).json({ message: `Warehouse is full for ${size_type} packages.` });
        }

        // Store it
        const insertQuery = `INSERT INTO packages (size_type) VALUES (?)`;
        const [result] = await connection.query(insertQuery, [size_type]);

        // MySQL returns the new ID as "insertId"
        const [newPackage] = await connection.query(`SELECT * FROM packages WHERE package_id = ?`, [result.insertId]);

        await connection.commit();
        res.status(201).json(newPackage[0]);
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        // ALWAYS release the connection back to the pool when done
        if (connection) connection.release(); 
    }
});

// 4. View All Packages
app.get('/api/packages', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM packages ORDER BY stored_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Remove Package
app.delete('/api/packages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM packages WHERE package_id = ?', [id]);
        
        // MySQL uses "affectedRows" to tell you how many items were deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.json({ message: "Package removed, space freed." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Start the Server (You were missing this at the bottom!)
const PORT = process.env.PORT || 4000; 

app.listen(PORT, () => {
    console.log(`🚀 Server Running on port ${PORT}`);
});
