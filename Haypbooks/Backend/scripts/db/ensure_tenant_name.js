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
    await c.query('ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "name" TEXT');
    await c.query('UPDATE "Tenant" SET "name" = "firmName" WHERE "name" IS NULL AND "firmName" IS NOT NULL');
    console.log('tenant.name ensured and backfilled');
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();