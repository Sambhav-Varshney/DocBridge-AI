const express = require('express');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        try {
            const pool = getPool();
            const [rows] = await pool.execute(`SELECT id FROM users WHERE id = ?`, [user.id]);
            if (!rows || rows.length === 0) {
                return res.status(401).json({ error: 'Session expired (user not found). Please logout and login again.' });
            }
        } catch (dbError) {
            console.error('Error validating user token:', dbError);
        }

        req.user = user;
        next();
    });
};

// Get available slots for a doctor on a specific date
router.get('/slots/:doctorId', authenticateToken, async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const pool = getPool();

        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let startHour = isWeekend ? 11 : 10;
        let endHour = isWeekend ? 14 : 18;

        const allSlots = [];
        for (let h = startHour; h < endHour; h++) {
            const hStr = h.toString().padStart(2, '0');
            allSlots.push(`${hStr}:00`);
            allSlots.push(`${hStr}:30`);
        }

        const [existingAppointments] = await pool.execute(
            `SELECT time FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'REJECTED'`,
            [doctorId, date]
        );
        const bookedTimes = existingAppointments.map(a => a.time);

        const slots = allSlots.map(time => ({
            time,
            available: !bookedTimes.includes(time)
        }));

        res.json({ slots });
    } catch (error) {
        console.error('GET /api/appointments/slots error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create an appointment
router.post('/', authenticateToken, async (req, res) => {
    const { doctor_id, date, time, reason } = req.body;
    try {
        // Validation: Reject past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(date);
        if (isNaN(selected.getTime()) || selected < today) {
            return res.status(400).json({ error: 'Appointment date cannot be in the past.' });
        }

        const pool = getPool();

        // Validation: Verify if slot is already booked
        const [existing] = await pool.execute(
            `SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'REJECTED'`,
            [doctor_id, date, time]
        );
        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked.' });
        }

        await pool.execute(
            `INSERT INTO appointments (patient_id, doctor_id, date, time, reason) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, doctor_id, date, time, reason]
        );
        res.status(201).json({ message: 'Appointment requested successfully!' });
    } catch (error) {
        console.error('POST /api/appointments error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get patient's appointments
router.get('/patient', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        // doctors table has: id, name, specialization — no user_id FK
        const [rows] = await pool.execute(`
            SELECT a.id, a.doctor_id, a.date, a.time, a.reason, a.status,
                   u2.fullName as doctorName, d.specialization as specialty
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u2 ON d.user_id = u2.id
            WHERE a.patient_id = ?
            ORDER BY a.date DESC, a.time DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('GET /api/appointments/patient error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get doctor's appointments
router.get('/doctor', authenticateToken, async (req, res) => {
    if (req.user.role !== 'doctor' || !req.user.doctorId) {
        return res.status(403).json({ error: 'Access denied. Only doctors can view this.' });
    }

    try {
        const pool = getPool();
        const [rows] = await pool.execute(`
            SELECT a.id, a.patient_id, a.date, a.time, a.reason, a.status,
                   u.fullName as patientName, u.email as patientEmail
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = ?
            ORDER BY a.date ASC, a.time ASC
        `, [req.user.doctorId]);
        res.json(rows);
    } catch (error) {
        console.error('GET /api/appointments/doctor error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update appointment status
router.put('/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    const { status } = req.body;
    try {
        const pool = getPool();
        await pool.execute(
            `UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?`,
            [status, req.params.id, req.user.doctorId]
        );
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('PUT /api/appointments/:id/status error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get visit history between a patient and doctor
router.get('/history/:patientId/:doctorId', authenticateToken, async (req, res) => {
    const { patientId, doctorId } = req.params;
    try {
        const pool = getPool();
        const [history] = await pool.execute(`
            SELECT id, date, time, status, reason
            FROM appointments
            WHERE patient_id = ? AND doctor_id = ?
            ORDER BY date DESC, time DESC
        `, [patientId, doctorId]);

        if (!history || history.length === 0) {
            return res.json({ hasHistory: false });
        }

        const totalVisits = history.length;
        const lastVisit = history[0];
        const approved = history.filter(h => h.status === 'APPROVED').length;
        const rejected = history.filter(h => h.status === 'REJECTED').length;
        const pending = history.filter(h => h.status === 'PENDING').length;

        res.json({
            hasHistory: true,
            totalVisits,
            lastVisitDate: lastVisit.date,
            lastVisitTime: lastVisit.time,
            lastVisitStatus: lastVisit.status,
            lastVisitReason: lastVisit.reason,
            approved,
            rejected,
            pending
        });
    } catch (error) {
        console.error('GET /api/appointments/history error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
