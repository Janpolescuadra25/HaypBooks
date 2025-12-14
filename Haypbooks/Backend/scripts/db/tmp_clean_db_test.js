const {Client}=require('pg'); (async ()=>{
  const admin='postgresql://postgres:Ninetails45@localhost:5432/postgres';
  const client=new Client({connectionString:admin});
  try{ await client.connect(); await client.query('DROP DATABASE IF EXISTS test_clean_db;'); await client.query('CREATE DATABASE test_clean_db TEMPLATE template0;'); console.log('Created test_clean_db'); }catch(e){ console.error('err:', e.message); process.exit(1);} finally{ await client.end(); }
  const db='postgresql://postgres:Ninetails45@localhost:5432/test_clean_db';
  const c=new Client({connectionString:db});
  await c.connect();
  await c.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await c.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  const res=await c.query("select table_schema, table_name from information_schema.tables where table_schema='public' and table_name='User';");
  console.log('User rows:', JSON.stringify(res.rows));
  await c.end();
})();