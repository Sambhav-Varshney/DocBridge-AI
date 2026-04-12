const bcrypt = require('bcrypt');
const { initDB } = require('./backend/db');

async function seed() {
    const db = await initDB();
    
    // Check if doctors already exist
    const doctors = await db.all("SELECT * FROM doctors");
    if (doctors.length > 0) {
        console.log("Doctors already exist. Exiting.");
        return;
    }

    const dummyDoctors = [
        { fullName: "Alice Smith", email: "alice@hospital.com", role: "doctor", specialty: "Cardiologist", experience: "10 years" },
        { fullName: "Bob Jones", email: "bob@hospital.com", role: "doctor", specialty: "Dermatologist", experience: "5 years" },
        { fullName: "Charlie Brown", email: "charlie@hospital.com", role: "doctor", specialty: "Neurologist", experience: "8 years" },
        { fullName: "Diana Prince", email: "diana@hospital.com", role: "doctor", specialty: "General Physician", experience: "15 years" }
    ];

    const password = await bcrypt.hash("password123", 10);

    for (const doc of dummyDoctors) {
        try {
            const result = await db.run(
                `INSERT INTO users (fullName, email, password, role, phone, gender) VALUES (?, ?, ?, ?, ?, ?)`,
                [doc.fullName, doc.email, password, doc.role, "123-456-7890", "Other"]
            );
            await db.run(
                `INSERT INTO doctors (user_id, specialty, experience) VALUES (?, ?, ?)`,
                [result.lastID, doc.specialty, doc.experience]
            );
            console.log(`Inserted Dr. ${doc.fullName}`);
        } catch (err) {
            console.error(`Failed to insert ${doc.fullName}:`, err.message);
        }
    }
    console.log("Seeding complete!");
}

seed();
