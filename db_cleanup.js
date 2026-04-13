/**
 * db_cleanup.js — Safely removes only corrupt/invalid appointment records.
 * Does NOT touch users, doctors, or valid appointments.
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

function isValidDate(str) {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const year = parseInt(str.split('-')[0]);
    return year >= 2020 && year <= 2100;
}

db.serialize(() => {
    // 1. Find appointments with corrupt dates (read first, then delete)
    db.all("SELECT id, date, patient_id, doctor_id, status FROM appointments", (err, rows) => {
        if (err) { console.error('Read error:', err); return; }

        const corrupt = rows.filter(r => !isValidDate(r.date));
        
        if (corrupt.length === 0) {
            console.log('✓ No corrupt records found. Database is clean.');
            db.close();
            return;
        }

        console.log(`Found ${corrupt.length} corrupt appointment(s) to remove:`);
        corrupt.forEach(r => console.log(`  Deleting ID=${r.id} | date="${r.date}" | patient=${r.patient_id} | doctor=${r.doctor_id} | status=${r.status}`));

        const ids = corrupt.map(r => r.id);
        const placeholders = ids.map(() => '?').join(',');

        db.run(`DELETE FROM appointments WHERE id IN (${placeholders})`, ids, function(err2) {
            if (err2) {
                console.error('Delete error:', err2);
            } else {
                console.log(`\n✓ Successfully deleted ${this.changes} corrupt appointment record(s).`);
            }

            // Verify final state
            db.all("SELECT id, date, status FROM appointments ORDER BY id", (err3, final) => {
                console.log(`\n✓ Remaining valid appointments: ${final.length}`);
                final.forEach(r => console.log(`  [${r.id}] date=${r.date} | status=${r.status}`));
                db.close();
            });
        });
    });
});
