# 🏥 DocBridge — AI-Powered Doctor Appointment Platform

> A production-ready, full-stack healthcare appointment management platform built with **Node.js**, **Express**, **SQLite**, and a premium glassmorphism UI. Features AI-powered symptom analysis via Google Gemini and a complete visit history system.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with 1-day token expiry
- bcrypt password hashing (10 salt rounds)
- Role-based access control: **Patient** and **Doctor** roles
- Protected API routes with token middleware

### 📅 Smart Appointment Booking
- Browse available verified doctors by specialty
- Smart time-slot grid (weekday 10AM–6PM / weekend 11AM–2PM)
- Real-time slot availability — no double bookings
- Past-date booking blocked (frontend `min` + backend validation)
- Reason for visit field

### 🏥 Patient Dashboard
- View all personal appointments with status badges (PENDING / APPROVED / REJECTED)
- **Visit History cards** — shows total visits per doctor, last appointment date/time, and status
- AI Symptom Checker integration
- Full booking modal with animated slot picker

### 👨‍⚕️ Doctor Dashboard
- View all incoming patient appointment requests
- Stats strip: Total / Pending / Approved / Rejected
- Accept or Reject appointments with one click
- **Patient Visit History cards** — see how many times a patient has visited before
- Patient name, email, date, time, and reason displayed

### 🤖 AI Symptom Checker (Gemini-powered)
- Describe symptoms → get specialist recommendation
- Powered by Google Gemini 1.5 Flash
- Smart keyword-based fallback if API key is unavailable
- Integrated directly in the patient dashboard

### 🗄️ Database
- SQLite via `better-sqlite3` / `sqlite` drivers
- Tables: `users`, `doctors`, `appointments`
- Foreign key constraints and status tracking
- `db_reset_seed.js` — platform initialization and data seeding script
- `db_audit.js` — read-only database inspector
- `db_cleanup.js` — removes corrupt records safely

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `sqlite` + `sqlite3`) |
| **Auth** | JSON Web Tokens, bcrypt |
| **AI** | Google Generative AI (Gemini 1.5 Flash) |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Design** | Glassmorphism, CSS custom properties, Outfit font |
| **Icons** | Boxicons |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed
- A terminal / command prompt

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Sambhav-Varshney/DocBridge-AI.git
cd DocBridge-AI

# 2. Install dependencies
npm install

# 3. Create environment file
# Create a file named .env in the root directory with:
```

**.env file contents:**
```
PORT=3000
JWT_SECRET=docbridge_super_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 Get a free Gemini API key at https://aistudio.google.com/apikey  
> The platform works without it using the built-in keyword fallback.

```bash
# 4. Initialize the platform with seed data
node db_reset_seed.js

# 5. Start the server
npm run dev

# 6. Open in browser
# Go to: http://localhost:3000
```

---

## 🔑 Reviewer Access

The following accounts are pre-seeded for platform review and evaluation:

| Role | Email | Password |
|------|-------|----------|
| 👩‍⚕️ **Doctor** (Cardiologist) | `priya.sharma@docbridge.com` | `Doctor@123` |
| 👨‍⚕️ **Doctor** (Neurologist) | `arjun.mehta@docbridge.com` | `Doctor@123` |
| 🧑 **Patient** | `rohan.verma@docbridge.com` | `Patient@123` |

> New accounts can also be registered live — both Patient and Doctor registration flows are fully operational.

---

## 📁 Project Structure

```
DocBridge-AI/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── db.js                  # SQLite connection & table init
│   └── routes/
│       ├── auth.js            # Register & Login endpoints
│       ├── doctors.js         # List all doctors
│       ├── appointments.js    # Booking, slots, history, status
│       └── ai.js              # Gemini AI symptom checker
├── frontend/
│   ├── index.html             # Landing page
│   ├── login.html             # Login page
│   ├── register.html          # Registration (patient + doctor)
│   ├── patient.html           # Patient dashboard
│   ├── doctor.html            # Doctor dashboard
│   └── style.css              # Full design system
├── db_reset_seed.js           # Platform initialization & data seeding
├── db_audit.js                # Database read-only inspector
├── db_cleanup.js              # Corrupt record cleaner
├── package.json
└── .env                       # ← Create this (not committed)
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient or doctor |
| POST | `/api/auth/login` | Login and receive JWT |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all verified doctors |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/slots/:doctorId?date=` | Available time slots |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments/patient` | Patient's appointments |
| GET | `/api/appointments/doctor` | Doctor's appointment requests |
| PUT | `/api/appointments/:id/status` | Approve or reject |
| GET | `/api/appointments/history/:patientId/:doctorId` | Visit history |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/recommend` | Symptom → Specialist recommendation |

---

## 🛡️ Security Notes
- `.env` and `database.sqlite` are gitignored — never committed
- All passwords are bcrypt-hashed before storage
- All protected routes require a valid JWT in the `Authorization: Bearer <token>` header
- Past dates are rejected both client-side (input `min`) and server-side

---

## 👨‍💻 Author

**Sambhav Varshney**  
GitHub: [@Sambhav-Varshney](https://github.com/Sambhav-Varshney)

---

*DocBridge is a full-stack SaaS platform for modern healthcare appointment management.*
