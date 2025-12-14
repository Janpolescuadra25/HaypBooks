const { Client } = require('pg');
(async () => {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_debug_uuid';
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('Tables:', res.rows.map(r => r.table_name));
  } finally {
    await client.end();
  }
})();
