const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';
const c = new Client({ connectionString: conn });
(async () => {
  try {
    await c.connect();
    const r = await c.query(`SELECT table_name FROM information_schema.columns WHERE column_name='tenantId_old'`);
    const tables = [...new Set(r.rows.map(r => r.table_name))];
    console.log('Found tenantId_old in tables:', tables.length);
    for (const t of tables) {
      try {
        await c.query(`ALTER TABLE public."${t}" DROP COLUMN IF EXISTS "tenantId_old" CASCADE`);
        console.log('Dropped tenantId_old from', t);
      } catch (e) { console.error('Could not drop from', t, e.message.split('\n')[0]); }
    }
  } catch (e) { console.error(e); }
  finally { await c.end(); }
})();