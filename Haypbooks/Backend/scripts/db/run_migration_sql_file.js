const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
(async () => {
  const filePath = path.resolve(__dirname, '../../prisma/migrations-preview/20251215020000_convert_tenantid_to_uuid/migration.sql');
  if (!fs.existsSync(filePath)) { console.error('Migration SQL file not found:', filePath); process.exit(1); }
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  try {
    console.log('Running migration SQL file:', filePath);
    await client.query(sql);
    console.log('Migration SQL executed successfully');
  } catch (e) {
    console.error('Error executing migration sql:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})().catch(e => { console.error(e); process.exit(1) });