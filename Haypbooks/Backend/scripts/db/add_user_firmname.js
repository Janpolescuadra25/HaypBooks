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
    await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firmname" TEXT');
    console.log('Added firmname column to User (if not exists)');
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();