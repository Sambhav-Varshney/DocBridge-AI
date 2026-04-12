const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
let genAI = null;

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const fallbackPredictor = (symptoms) => {
    const text = symptoms.toLowerCase();
    let recommendation = "General Physician"; // default

    if (text.includes("heart") || text.includes("chest pain") || text.includes("palpitation")) {
        recommendation = "Cardiologist";
    } else if (text.includes("skin") || text.includes("rash") || text.includes("acne")) {
        recommendation = "Dermatologist";
    } else if (text.includes("headache") || text.includes("dizzy") || text.includes("vision") || text.includes("numb")) {
        recommendation = "Neurologist";
    } else if (text.includes("stomach") || text.includes("digestion") || text.includes("acid")) {
        recommendation = "Gastroenterologist";
    } else if (text.includes("bone") || text.includes("joint") || text.includes("knee") || text.includes("back pain")) {
        recommendation = "Orthopedist";
    } else if (text.includes("tooth") || text.includes("teeth") || text.includes("gum")) {
        recommendation = "Dentist";
    }

    return recommendation;
};

router.post('/recommend', async (req, res) => {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: "Please provide symptoms" });

    try {
        let recommendation = "";

        if (genAI) {
            // Use Gemini API
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a medical AI assistant. Based on the following symptoms, recommend ONE specialized doctor type (e.g., Cardiologist, Dermatologist, General Physician, Neurologist, Orthopedist, Gastroenterologist). Do not provide any explanation, just the specialty name. Symptoms: ${symptoms}`;
            
            const result = await model.generateContent(prompt);
            const response = result.response;
            recommendation = response.text().trim();
            // Just in case it gives extra text, parse out the most likely word
        } else {
            // Fallback
            recommendation = fallbackPredictor(symptoms);
        }

        res.json({
            recommendation,
            message: `Based on your symptoms, we recommend consulting a ${recommendation}.`
        });
    } catch (error) {
        console.error("AI Error: ", error);
        // Fallback in case of API error
        const backupRec = fallbackPredictor(symptoms);
        res.json({
            recommendation: backupRec,
            message: `Based on your symptoms, we recommend consulting a ${backupRec}.`
        });
    }
});

module.exports = router;
