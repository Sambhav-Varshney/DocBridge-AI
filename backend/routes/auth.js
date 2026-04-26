const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { fullName, email, password, role, phone, gender, dob, specialty, experience } = req.body;

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ error: 'Full name, email, password and role are required.' });
    }

    try {
        const pool = getPool();

        // Check duplicate email
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'An account with this email already exists.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (fullName, email, password, role, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fullName.trim(), email.trim().toLowerCase(), hashedPassword, role, phone || null, gender || null, dob || null]
        );

        const userId = result.insertId;

        // If registering as doctor, create a doctors row linked to this user
        if (role === 'doctor') {
            const doctorName = fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`;
            await pool.execute(
                'INSERT INTO doctors (user_id, name, specialization, experience, fees) VALUES (?, ?, ?, ?, ?)',
                [userId, doctorName, specialty || 'General Physician', parseInt(experience) || 1, 300.00]
            );
        }

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const pool = getPool();
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

        if (!rows || rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        // Fetch doctorId if doctor role
        let doctorId = null;
        if (user.role === 'doctor') {
            const [docRows] = await pool.execute('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
            if (docRows && docRows.length > 0) doctorId = docRows[0].id;
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
