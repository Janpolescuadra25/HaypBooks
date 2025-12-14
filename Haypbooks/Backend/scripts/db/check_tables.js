const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
  try {
    await c.connect();
    const names = ['Tenant','TenantUser','AccountType','Account','TaxRate','JournalEntry','PayrollRun'];
    for (const name of names) {
      const res = await c.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) as exists", [name]);
      console.log(name, res.rows[0].exists);
    }
  } catch (err) { console.error(err); process.exitCode = 1 }
  finally { await c.end() }
})()
