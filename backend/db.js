const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'Code@cs123',
            database: 'docbridge',
            waitForConnections: true,
            connectionLimit: 10
        });
    }
    return pool;
}

async function getDB() {
    if (!pool) {
        pool = mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'Code@cs123',
            database: 'docbridge',
            waitForConnections: true,
            connectionLimit: 10
        });
    }

    return {
        // one row
        async get(sql, params = []) {
            const [rows] = await pool.execute(sql, params);
            return rows[0] || null;
        },

        // all rows
        async all(sql, params = []) {
            const [rows] = await pool.execute(sql, params);
            return rows;
        },

        // insert / update / delete
        async run(sql, params = []) {
            const [result] = await pool.execute(sql, params);
            result.lastID = result.insertId;
            result.changes = result.affectedRows;
            return result;
        },

        async exec(sql) {
            const [result] = await pool.query(sql);
            return result;
        }
    };
}

async function initDB() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'Code@cs123',
        database: 'docbridge',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS docbridge`);
    await connection.end();

    const db = await getDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullName VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(50),
            phone VARCHAR(30),
            gender VARCHAR(20),
            dob VARCHAR(30)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNIQUE,
            name VARCHAR(100),
            specialization VARCHAR(100),
            experience INT,
            fees DECIMAL(10,2) DEFAULT 300.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            doctor_id INT,
            date VARCHAR(30),
            time VARCHAR(20),
            reason TEXT,
            status VARCHAR(30) DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS symptom_checks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            symptoms TEXT NOT NULL,
            result VARCHAR(255) NOT NULL,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

module.exports = { getDB, getPool, initDB };