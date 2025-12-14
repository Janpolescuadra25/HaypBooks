const { Client } = require('pg');
(async()=>{
  const c=new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'});
  await c.connect();
  try {
    await c.query('INSERT INTO public."StockLocation" ("tenantId","companyId","name","description","isDefault") VALUES ($1,$2,$3,$4,$5)', ['4e4e8d0b-a3f7-43a5-aaa2-7158ddb7ca62', null, 'Main Warehouse', 'Primary inventory location', true]);
    console.log('Inserted via raw SQL');
  } catch (e) { console.error('Raw SQL failed:', e); }
  await c.end();
})().catch(e=>{console.error(e);process.exit(1)})
