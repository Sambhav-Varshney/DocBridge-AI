const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Register User
router.post('/register', async (req, res) => {
    const { fullName, email, password, role, phone, gender, dob, specialty, experience } = req.body;
    try {
        const db = await getDB();
        const existingUser = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.run(
            `INSERT INTO users (fullName, email, password, role, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fullName, email, hashedPassword, role, phone, gender, dob]
        );

        const userId = result.lastID;

        // If user is a doctor, insert them into doctors table as well
        if (role === 'doctor') {
            await db.run(
                `INSERT INTO doctors (user_id, specialty, experience) VALUES (?, ?, ?)`,
                [userId, specialty || 'General Physician', experience || '1 year']
            );
        }

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await getDB();
        console.log(`Login attempt: email=${email}, password=${password}`);
        const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
        console.log(`User found:`, user);
        
        if (!user) {
            console.log('User not found in DB');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match result: ${isMatch}`);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        let doctorId = null;
        if (user.role === 'doctor') {
            const doctor = await db.get(`SELECT id FROM doctors WHERE user_id = ?`, [user.id]);
            if (doctor) doctorId = doctor.id;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, doctorId }, 
            SECRET_KEY, 
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                doctorId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
