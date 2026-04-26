const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Code@cs123',
    database: 'docbridge'
  });

  // 1. Disable FK checks, clear stale data
  await c.execute('SET FOREIGN_KEY_CHECKS=0');
  await c.execute('TRUNCATE TABLE appointments');
  await c.execute('TRUNCATE TABLE doctors');
  await c.execute('SET FOREIGN_KEY_CHECKS=1');
  console.log('✓ Cleared appointments and doctors tables.');

  // 2. Add user_id column (skip if already exists)
  try {
    await c.execute('ALTER TABLE doctors ADD COLUMN user_id INT UNIQUE AFTER id');
    console.log('✓ Added user_id column to doctors.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('  user_id column already exists, skipping.');
    } else {
      throw e;
    }
  }

  // 3. Add FK constraint (skip if already exists)
  try {
    await c.execute(
      'ALTER TABLE doctors ADD CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    );
    console.log('✓ Added FK: doctors.user_id → users.id');
  } catch (e) {
    console.log('  FK note (may already exist):', e.message);
  }

  // 4. Insert real doctor rows linked to actual user accounts
  //    users: id=1 Rahul (doctor), id=2 Priya (doctor), id=3 Amit (doctor)
  await c.execute(
    'INSERT INTO doctors (user_id, name, specialization, experience, fees) VALUES (?, ?, ?, ?, ?)',
    [1, 'Dr. Rahul', 'Cardiologist', 8, 500.00]
  );
  await c.execute(
    'INSERT INTO doctors (user_id, name, specialization, experience, fees) VALUES (?, ?, ?, ?, ?)',
    [2, 'Dr. Priya', 'Dermatologist', 5, 400.00]
  );
  await c.execute(
    'INSERT INTO doctors (user_id, name, specialization, experience, fees) VALUES (?, ?, ?, ?, ?)',
    [3, 'Dr. Amit', 'Orthopedic Surgeon', 10, 600.00]
  );
  console.log('✓ Inserted 3 real doctor records.');

  const [docs] = await c.execute('SELECT d.*, u.email FROM doctors d JOIN users u ON d.user_id = u.id');
  console.log('\nFinal doctors table:');
  docs.forEach(d => console.log(`  id=${d.id} | user_id=${d.user_id} | ${d.name} | ${d.specialization} | ${d.experience}yrs | ₹${d.fees} | ${d.email}`));

  await c.end();
  console.log('\nDone.');
})();
