const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM "_prisma_migrations" ORDER BY id');
    console.log(res.rows);
  } catch (e) {
    console.error('Error reading _prisma_migrations:', e.message);
  } finally {
    await client.end();
  }
})();