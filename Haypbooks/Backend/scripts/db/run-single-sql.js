const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
(async () => {
  const rel = process.argv[2];
  if (!rel) { console.error('Usage: node run-single-sql.js <relative-path-to-sql>'); process.exit(1) }
  const filePath = path.resolve(__dirname, '../../', rel);
  if (!fs.existsSync(filePath)) { console.error('Migration SQL file not found:', filePath); process.exit(1); }
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' });
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