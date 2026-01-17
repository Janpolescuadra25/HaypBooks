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
    const res = await c.query("INSERT INTO public.\"Tenant\" (\"id\", \"name\", \"baseCurrency\") VALUES ($1,$2,$3) RETURNING id", ['t-test-1', 'Tenant Test', 'USD']);
    console.log('inserted tenant', res.rows[0]);
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();