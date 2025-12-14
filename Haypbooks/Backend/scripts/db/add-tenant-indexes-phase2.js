#!/usr/bin/env node
const { Client } = require('pg')

const TABLES = ['Account','BankAccount','BankTransaction','InvoiceLine','JournalEntry','Bill','PurchaseOrder','Customer','Vendor']
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

async function main(){
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try{
    for(const t of TABLES){
      console.log('Ensuring tenant index for', t)
      try{
        await client.query(`CREATE INDEX IF NOT EXISTS "${t}_tenantId_idx" ON "${t}"("tenantId")`)
        console.log(t, 'index ensured')
      }catch(e){
        console.warn('failed to create index for', t, e.message)
      }
    }
    console.log('Tenant indexes ensured')
  }finally{
    await client.end()
  }
}

main().catch(e=>{console.error(e); process.exit(1)})