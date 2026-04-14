# 🏥 DocBridge — AI-Powered Doctor Appointment Platform

> A full-stack healthcare appointment management platform featuring AI-powered symptom analysis, smart scheduling, and a premium glassmorphic interface.

[Live Demo Placeholder](https://your-demo-link.com)

---

## 🚀 Overview

DocBridge is a comprehensive healthcare solution designed to bridge the gap between patients and medical professionals. The platform streamlines the appointment booking process using an intelligent slot-allocation system and leverages Google Gemini AI to provide initial symptom-based specialist recommendations.

## ✨ Key Features

- **🤖 AI-Driven Triage**: Integration with Google Gemini 1.5 Flash to analyze symptoms and recommend appropriate specialists.
- **📅 Smart Scheduling**: Real-time appointment slot management with automated availability checks and conflict prevention.
- **🔐 Secure Authentication**: Robust security using JWT-based authentication and role-based access control (RBAC) for Patients and Doctors.
- **📊 Interactive Dashboards**: Dedicated data-driven interfaces for both roles to manage history, status, and schedules.
- **💎 Premium UI/UX**: Modern, responsive design built with a glassmorphism aesthetic for an enhanced user experience.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **AI**: Google Generative AI (Gemini SDK)
- **Security**: JWT, bcrypt
- **Frontend**: Vanilla JavaScript, CSS3 (Custom Properties), HTML5
- **Icons**: Boxicons

## 📸 Screenshots

*(Add your screenshots here)*

| Landing Page | Patient Dashboard | AI Symptom Checker |
| :---: | :---: | :---: |
| ![Landing Placeholder](https://via.placeholder.com/800x450?text=Landing+Page) | ![Dashboard Placeholder](https://via.placeholder.com/800x450?text=Patient+Dashboard) | ![AI Placeholder](https://via.placeholder.com/800x450?text=AI+Symptom+Checker) |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Google Gemini API Key (Optional: System includes a keyword-based fallback)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sambhav-Varshney/DocBridge-AI.git
   cd DocBridge-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your_secure_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Initialize & Run**
   ```bash
   node db_reset_seed.js  # Seeds initial platform data
   npm run dev            # Starts development server
   ```

Access the platform at `http://localhost:3000`.

---

## 👨‍💻 Author

**Sambhav Varshney**  
- GitHub: [@Sambhav-Varshney](https://github.com/Sambhav-Varshney)

---

*Built as a production-representative healthcare management platform.*
