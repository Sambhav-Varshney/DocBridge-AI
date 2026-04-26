/**
 * db_reset_seed.js
 * Wipes ALL existing data and initializes the platform database with:
 *   - 2 professional doctors
 *   - 1 evaluation patient
 * Run ONCE to initialize the platform with pre-seeded data.
 */
const sqlite3 = require('sqlite3').verbose();
const bcrypt  = require('bcrypt');
const path    = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
const SALT_ROUNDS = 10;

async function hashPassword(pw) {
    return bcrypt.hash(pw, SALT_ROUNDS);
}

async function run() {
    console.log('🗑️  Wiping all existing data...');

    await new Promise((res, rej) => db.serialize(() => {
        db.run('DELETE FROM appointments', err => { if (err) rej(err); });
        db.run('DELETE FROM doctors',      err => { if (err) rej(err); });
        db.run('DELETE FROM users',        err => { if (err) rej(err); });
        // Reset auto-increment counters
        db.run("DELETE FROM sqlite_sequence WHERE name IN ('appointments','doctors','users')", err => {
            if (err) console.log('(sqlite_sequence reset skipped — ok)');
            res();
        });
    }));

    console.log('✓  All tables cleared.');

    // ── Doctor 1: Cardiologist ──────────────────────────────────────
    const pw1 = await hashPassword('Doctor@123');
    await new Promise((res, rej) => db.run(
        `INSERT INTO users (fullName, email, password, role, phone, gender, dob)
         VALUES (?, ?, ?, 'doctor', ?, 'female', '1982-03-15')`,
        ['Dr. Priya Sharma', 'priya.sharma@docbridge.com', pw1, '+91 98100 11223'],
        function(err) { if (err) rej(err); else { const uid = this.lastID;
            db.run(`INSERT INTO doctors (user_id, specialty, experience) VALUES (?, 'Cardiologist', '12 years')`,
            [uid], err2 => { if (err2) rej(err2); else { console.log(`✓  Dr. Priya Sharma (Cardiologist) — user_id=${uid}`); res(); } });
        }}
    ));

    // ── Doctor 2: Neurologist ───────────────────────────────────────
    const pw2 = await hashPassword('Doctor@123');
    await new Promise((res, rej) => db.run(
        `INSERT INTO users (fullName, email, password, role, phone, gender, dob)
         VALUES (?, ?, ?, 'doctor', ?, 'male', '1978-07-22')`,
        ['Dr. Arjun Mehta', 'arjun.mehta@docbridge.com', pw2, '+91 98200 33445'],
        function(err) { if (err) rej(err); else { const uid = this.lastID;
            db.run(`INSERT INTO doctors (user_id, specialty, experience) VALUES (?, 'Neurologist', '15 years')`,
            [uid], err2 => { if (err2) rej(err2); else { console.log(`✓  Dr. Arjun Mehta (Neurologist) — user_id=${uid}`); res(); } });
        }}
    ));

    // ── Evaluation Patient ──────────────────────────────────────────
    const pw3 = await hashPassword('Patient@123');
    await new Promise((res, rej) => db.run(
        `INSERT INTO users (fullName, email, password, role, phone, gender, dob)
         VALUES (?, ?, ?, 'patient', ?, 'male', '2000-06-15')`,
        ['Rohan Verma', 'rohan.verma@docbridge.com', pw3, '+91 99300 55667'],
        function(err) { if (err) rej(err); else { console.log(`✓  Evaluation Patient — Rohan Verma (user_id=${this.lastID})`); res(); } }
    ));

    // ── Verify ──────────────────────────────────────────────────────
    db.all('SELECT u.id, u.fullName, u.email, u.role, d.specialty, d.experience FROM users u LEFT JOIN doctors d ON d.user_id = u.id ORDER BY u.id', (err, rows) => {
        console.log('\n✅ Final DB state:');
        rows.forEach(r => {
            if (r.role === 'doctor') console.log(`   DOCTOR  [${r.id}] ${r.fullName} | ${r.email} | ${r.specialty} | ${r.experience}`);
            else                     console.log(`   PATIENT [${r.id}] ${r.fullName} | ${r.email}`);
        });
        console.log('\n🔑 Evaluation Access:');
        console.log('   DOCTOR 1 : priya.sharma@docbridge.com  / Doctor@123');
        console.log('   DOCTOR 2 : arjun.mehta@docbridge.com   / Doctor@123');
        console.log('   PATIENT  : rohan.verma@docbridge.com   / Patient@123');
        db.close();
    });
}

run().catch(err => { console.error('❌ Error:', err); db.close(); });
