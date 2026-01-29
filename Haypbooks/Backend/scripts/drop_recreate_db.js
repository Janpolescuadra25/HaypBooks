const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:Ninetails45@localhost:5432/postgres' });
  try {
    await c.connect();
    console.log('Killing existing connections to haypbooks_dev...');
    await c.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='haypbooks_dev' AND pid <> pg_backend_pid();");
    console.log('Dropping database if exists...');
    await c.query('DROP DATABASE IF EXISTS haypbooks_dev');
    console.log('Creating database...');
    await c.query('CREATE DATABASE haypbooks_dev');
    console.log('Done');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await c.end();
  }
})();