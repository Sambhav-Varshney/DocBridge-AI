const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');

async function getDB() {
    return open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });
}

async function initDB() {
    const db = await getDB();
    
    // Create Users Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL, 
            phone TEXT,
            gender TEXT,
            dob TEXT
        )
    `);

    // Create Doctors Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            specialty TEXT,
            experience TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // Create Appointments Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'PENDING',
            FOREIGN KEY(patient_id) REFERENCES users(id),
            FOREIGN KEY(doctor_id) REFERENCES doctors(id)
        )
    `);

    return db;
}

module.exports = { getDB, initDB };
