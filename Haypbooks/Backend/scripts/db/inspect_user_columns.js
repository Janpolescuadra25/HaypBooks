const { Client } = require('pg');
(async () => {
  const cs = process.env.DATABASE_URL;
  if (!cs) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const c = new Client({ connectionString: cs });
  try {
    await c.connect();
    const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position");
    console.log('User columns:');
    for (const r of res.rows) console.log(r.column_name, r.data_type);
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();