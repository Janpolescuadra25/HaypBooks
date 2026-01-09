const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';
const c = new Client({ connectionString: conn });
(async () => {
  try {
    await c.connect();
    const r = await c.query(`SELECT table_name, column_name, udt_name, data_type
      FROM information_schema.columns WHERE table_name IN ('Tenant','Task') ORDER BY table_name, ordinal_position`);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) { console.error(e); }
  finally { await c.end(); }
})();