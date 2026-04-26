const express = require('express');
const { getPool } = require('../db');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const pool = getPool();
    // JOIN users so name/email comes from the real user account
        const [rows] = await pool.execute(`
            SELECT d.id as doctorId, u.fullName, u.email, d.specialization as specialty, d.experience, d.fees, u.gender, u.phone
            FROM doctors d
            JOIN users u ON d.user_id = u.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('GET /api/doctors error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
