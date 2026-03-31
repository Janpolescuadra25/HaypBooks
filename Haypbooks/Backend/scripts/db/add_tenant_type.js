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
    const tableCheck = await c.query("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Tenant' LIMIT 1");
    if (tableCheck.rowCount === 0) {
      console.log('Tenant table does not exist; skipping tenant.type migration.')
      await c.end();
      return;
    }

    // Add type column as TEXT with default 'OWNER' if it doesn't exist
    await c.query("ALTER TABLE \"Tenant\" ADD COLUMN IF NOT EXISTS \"type\" TEXT DEFAULT 'OWNER'");
    await c.query("ALTER TABLE \"Tenant\" ALTER COLUMN \"type\" SET NOT NULL");
    console.log('tenant.type ensured');
    await c.end();
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();