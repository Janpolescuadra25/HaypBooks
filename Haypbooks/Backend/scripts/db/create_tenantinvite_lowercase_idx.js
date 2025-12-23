const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  await client.query('CREATE INDEX IF NOT EXISTS tenantinvite_email_idx ON public."TenantInvite" (email)');
  console.log('Created lowercase tenantinvite_email_idx if missing');
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });