# DocBridge Platform

A medical appointment and diagnostics platform that connects patients with healthcare professionals. The system includes role-based access, scheduling logic, and an integrated AI Symptom Checker.

## Key Features

* **Role-Based Access Control:** Separate dashboard flows for Patients and Doctors.
* **AI Symptom Analysis:** Integrated with Google Gemini API to analyze patient symptoms and recommend appropriate medical specialties.
* **Smart Scheduling:** Real-time appointment booking with protections against calendar conflicts and duplicate reservations.
* **Doctor Review Flow:** A dedicated interface for doctors to manage, approve, or reject patient visit requests.
* **Modern UI:** Responsive frontend built with custom CSS, focusing on clean layouts and usability.

## Technology Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using `mysql2` driver)
* **Authentication:** JWT (JSON Web Tokens), bcrypt
* **AI Integration:** Google Generative AI (`@google/generative-ai`)

## Local Setup

### 1. Prerequisites
Ensure you have Node.js (v18+) installed and a local MySQL server running.

### 2. Configure Environment
Create a `.env` file in the project's root directory:
```env
PORT=3000
JWT_SECRET=your_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Initialization
Configure your database credentials inside `backend/db.js`. The tables (`users`, `doctors`, `appointments`, and `symptom_checks`) are automatically created by the `initDB()` process on the first application startup. You can find useful database setup and seed scripts in the `scripts/` directory.

### 4. Install & Run
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## Deployment

The application is configured for standard Node.js hosting environments.
* **Render:** Deploy as a web service using the standard `npm start` command.
* **Vercel:** Compatible by using a `vercel.json` file with rewrite routing rules.

## Screenshots

*(Placeholder for application screenshots)*

---

*Repository maintained for technical demonstration.*
