const {Client} = require('pg');
const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }
const c = new Client({ connectionString: url });
(async () => {
  await c.connect();
  try {
    const res = await c.query('select id, migrated_at, checksum, name from "_prisma_migrations" order by migrated_at;');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e.stack || e.message || e);
  } finally {
    await c.end();
  }
})();
