const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Code@cs123',
    database: 'docbridge'
  });

  const plainPassword = '12345';
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log('Hashed password:', hashed);

  // Update all 3 doctor accounts
  const [result] = await c.execute(
    "UPDATE users SET password = ? WHERE role = 'doctor'",
    [hashed]
  );
  console.log(`✓ Updated ${result.affectedRows} doctor account(s).`);

  // Verify
  const [rows] = await c.execute("SELECT id, fullName, email, role FROM users WHERE role = 'doctor'");
  rows.forEach(r => console.log(`  ${r.fullName} | ${r.email} | password: ${plainPassword}`));

  await c.end();
  console.log('\nDone. All doctor passwords are now: 12345');
})();
