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
    await c.query('ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subdomain" TEXT');
    await c.query('ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "id_old" TEXT');
    console.log('tenant.subdomain/id_old ensured');
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();