const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const doctors = await db.all(`
            SELECT d.id as doctorId, u.fullName, u.email, d.specialty, d.experience, u.gender, u.phone 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
        `);
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
