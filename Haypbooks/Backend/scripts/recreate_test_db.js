const { Client } = require('pg')
;(async () => {
  const client = new Client({ connectionString: 'postgresql://postgres:Ninetails45@localhost:5432/postgres' })
  await client.connect()
  try {
    await client.query('DROP DATABASE IF EXISTS haypbooks_migration_test')
    await client.query('CREATE DATABASE haypbooks_migration_test')
    console.log('Recreated haypbooks_migration_test')
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await client.end()
  }
})()
