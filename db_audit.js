/**
 * db_audit.js — Read-only audit of all DB records.
 * Shows users, doctors, and appointments with date validation status.
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

function isValidDate(str) {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const year = parseInt(str.split('-')[0]);
    return year >= 2020 && year <= 2100;
}

db.serialize(() => {
    db.all("SELECT id, fullName, email, role FROM users ORDER BY id", (err, users) => {
        console.log('\n=== USERS ===');
        users.forEach(u => console.log(`  [${u.id}] ${u.role.toUpperCase()} | ${u.fullName} | ${u.email}`));
    });

    db.all("SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time, a.status, a.reason, u.fullName as patientName FROM appointments a JOIN users u ON a.patient_id = u.id ORDER BY a.id", (err, rows) => {
        console.log('\n=== APPOINTMENTS ===');
        if (!rows || rows.length === 0) { console.log('  (none)'); return; }
        rows.forEach(r => {
            const valid = isValidDate(r.date);
            const flag  = valid ? '✓' : '✗ CORRUPT DATE';
            console.log(`  [${r.id}] ${flag} | date=${r.date} time=${r.time} | patient_id=${r.patient_id} (${r.patientName}) | doctor_id=${r.doctor_id} | status=${r.status}`);
        });

        const corrupt = rows.filter(r => !isValidDate(r.date));
        console.log(`\n  Total: ${rows.length} | Corrupt dates: ${corrupt.length}`);
        if (corrupt.length > 0) {
            console.log('  Corrupt IDs to delete:', corrupt.map(r => r.id).join(', '));
        }
    });
});

setTimeout(() => db.close(), 1000);
