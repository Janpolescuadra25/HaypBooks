const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  await client.query('CREATE INDEX IF NOT EXISTS customercreditline_customercreditid_idx ON public."CustomerCreditLine" ("customerCreditId")');
  console.log('Created customercreditline_customercreditid_idx if missing');
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });