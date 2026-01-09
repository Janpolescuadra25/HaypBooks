const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';
const c = new Client({ connectionString: conn });

(async () => {
  try {
    await c.connect();
    // find tables with tenantId column
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name='tenantId' AND table_schema='public'");
    const tables = Array.from(new Set(res.rows.map(r => r.table_name))).sort();
    console.log('Found tables with tenantId:', tables.length);
    for (const t of tables) {
      try {
        const totalR = await c.query(`SELECT COUNT(*) as cnt FROM public."${t}"`);
        const total = parseInt(totalR.rows[0].cnt, 10);
const orphanR = await c.query(`SELECT COUNT(*) as cnt FROM public."${t}" WHERE "tenantId" IS NOT NULL AND ("tenantId")::text NOT IN (SELECT id::text FROM public."Tenant")`);
        const orphan = parseInt(orphanR.rows[0].cnt, 10);
        if (orphan === 0) continue;
        console.log('\n-- Table:', t);
        console.log(`   total rows: ${total}, orphan tenantId rows: ${orphan} (${((orphan/Math.max(total,1))*100).toFixed(2)}%)`);
        const samples = await c.query(`SELECT ("tenantId")::text as tenantId, COUNT(*) as cnt FROM public."${t}" WHERE "tenantId" IS NOT NULL AND ("tenantId")::text NOT IN (SELECT id::text FROM public."Tenant") GROUP BY tenantId ORDER BY cnt DESC LIMIT 10`);
        console.log('   top orphan tenantIds (tenantId : count):');
        for (const row of samples.rows) console.log(`     ${row.tenantId} : ${row.cnt}`);
        const exampleRows = await c.query(`SELECT * FROM public."${t}" WHERE "tenantId" IS NOT NULL AND ("tenantId")::text NOT IN (SELECT id::text FROM public."Tenant") LIMIT 5`);
        console.log('   example rows:');
        for (const r of exampleRows.rows) console.log('     ', JSON.stringify(r));
      } catch (e) {
        console.error('Error checking table', t, e.message.split('\n')[0]);
      }
    }
    console.log('\nDone.');
  } catch (e) {
    console.error('Fatal error:', e.message);
  } finally {
    await c.end();
  }
})();
