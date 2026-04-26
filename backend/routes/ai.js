const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPool } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// ── Gemini setup ─────────────────────────────────────────────────────────────
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ── Auth middleware ───────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ── Fallback keyword-based predictor ─────────────────────────────────────────
const fallbackPredictor = (symptoms) => {
    const text = symptoms.toLowerCase();
    if (text.includes('heart') || text.includes('chest pain') || text.includes('palpitation'))
        return 'Cardiologist';
    if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('itch'))
        return 'Dermatologist';
    if (text.includes('headache') || text.includes('dizzy') || text.includes('vision') || text.includes('numb') || text.includes('migraine'))
        return 'Neurologist';
    if (text.includes('stomach') || text.includes('digestion') || text.includes('acid') || text.includes('vomit') || text.includes('nausea'))
        return 'Gastroenterologist';
    if (text.includes('bone') || text.includes('joint') || text.includes('knee') || text.includes('back pain') || text.includes('fracture'))
        return 'Orthopedic Surgeon';
    if (text.includes('tooth') || text.includes('teeth') || text.includes('gum') || text.includes('dental'))
        return 'Dentist';
    if (text.includes('eye') || text.includes('blurred vision') || text.includes('sight'))
        return 'Ophthalmologist';
    if (text.includes('ear') || text.includes('hearing') || text.includes('throat') || text.includes('nose'))
        return 'ENT Specialist';
    if (text.includes('child') || text.includes('infant') || text.includes('baby') || text.includes('fever') && text.includes('kid'))
        return 'Pediatrician';
    if (text.includes('anxiety') || text.includes('depression') || text.includes('mental') || text.includes('stress'))
        return 'Psychiatrist';
    return 'General Physician';
};

// ── POST /api/ai/recommend — analyze symptoms + save to DB ───────────────────
router.post('/recommend', authenticateToken, async (req, res) => {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.trim())
        return res.status(400).json({ message: 'Please provide symptoms' });

    try {
        let recommendation = '';

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `You are a medical AI assistant. Based on the following patient symptoms, recommend exactly ONE medical specialist type (e.g., Cardiologist, Dermatologist, General Physician, Neurologist, Orthopedic Surgeon, Gastroenterologist, Dentist, Ophthalmologist, ENT Specialist, Pediatrician, Psychiatrist). Respond with ONLY the specialist name — no explanation, no punctuation, just the specialty. Symptoms: ${symptoms}`;
                const result = await model.generateContent(prompt);
                recommendation = result.response.text().trim().replace(/\.$/, '');
            } catch (apiErr) {
                console.error('Gemini API error, using fallback:', apiErr.message);
                recommendation = fallbackPredictor(symptoms);
            }
        } else {
            recommendation = fallbackPredictor(symptoms);
        }

        // Save check to MySQL
        const pool = getPool();
        await pool.execute(
            'INSERT INTO symptom_checks (user_id, symptoms, result) VALUES (?, ?, ?)',
            [req.user.id, symptoms.trim(), recommendation]
        );

        res.json({
            recommendation,
            message: `Based on your symptoms, we recommend consulting a ${recommendation}.`
        });

    } catch (error) {
        console.error('AI route error:', error);
        const backupRec = fallbackPredictor(symptoms);
        res.json({
            recommendation: backupRec,
            message: `Based on your symptoms, we recommend consulting a ${backupRec}.`
        });
    }
});

// ── GET /api/ai/history — return past checks for logged-in user ───────────────
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.execute(
            'SELECT id, symptoms, result, checked_at FROM symptom_checks WHERE user_id = ? ORDER BY checked_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('AI history error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
