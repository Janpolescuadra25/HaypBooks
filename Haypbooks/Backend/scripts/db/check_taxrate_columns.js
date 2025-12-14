const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
  try {
    await c.connect();
    const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' ORDER BY ordinal_position");
    console.log('TaxRate columns:');
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  } catch (err) { console.error(err); process.exitCode = 1 }
  finally { await c.end() }
})()
