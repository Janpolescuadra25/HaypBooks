const {Client} = require('pg');
const table = process.argv[2];
(async()=>{
  const c=new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'});
  await c.connect();
  const res = await c.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position', ['public', table]);
  console.log(JSON.stringify(res.rows, null, 2));
  await c.end();
})();
