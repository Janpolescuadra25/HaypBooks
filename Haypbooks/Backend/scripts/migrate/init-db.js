#!/usr/bin/env node
// Initialize the PostgreSQL database if it does not exist.
const { Client } = require('pg')
const url = require('url')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set; please create a .env file')
    process.exit(1)
  }

  const parsed = url.parse(DATABASE_URL)
  // extract database name
  const dbName = (parsed.pathname || '').replace(/^\//, '') || 'postgres'

  // connect to 'postgres' default DB or template1
  const adminDb = 'postgres'
  const adminUrl = DATABASE_URL.replace(`/${dbName}`, `/${adminDb}`)
  const client = new Client({ connectionString: adminUrl })
  await client.connect()
  try {
    const recreate = process.argv.includes('--recreate') || process.env.FORCE_RESET_DB === '1'
    if (recreate) {
      console.log(`Recreating database ${dbName} (--recreate provided)`)
      // Terminate active connections and drop database
      await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [dbName])
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`)
      await client.query(`CREATE DATABASE ${dbName}`)
      console.log('Database recreated')
    } else {
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName])
      if (res.rowCount === 0) {
        console.log(`Database ${dbName} does not exist — creating`)
        await client.query(`CREATE DATABASE ${dbName}`)
        console.log('Database created')
      } else {
        console.log(`Database ${dbName} already exists`)
      }
    }
  } catch (err) {
    console.error('Failed to check/create database:', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
