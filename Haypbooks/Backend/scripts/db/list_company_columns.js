const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
  try {
    await c.connect();
    const res = await c.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='Company' ORDER BY ordinal_position");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
