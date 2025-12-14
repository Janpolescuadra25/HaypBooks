import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function upsertMany(modelName: string, items: any[]) {
  // Assumes each item has `id` as unique identifier
  for (const item of items) {
    await (prisma as any)[modelName].upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function main() {
  const fixturePath = process.argv[2] || path.resolve(process.cwd(), 'dev-fixtures/mock-db-snapshot.json')
  if (!fs.existsSync(fixturePath)) {
    console.error('snapshot not found:', fixturePath)
    process.exit(1)
  }
  const raw = fs.readFileSync(fixturePath, 'utf8')
  const snapshot = JSON.parse(raw)

  if (snapshot.tenants) await upsertMany('tenant', snapshot.tenants)
  if (snapshot.users) await upsertMany('user', snapshot.users)
  if (snapshot.accounts) await upsertMany('account', snapshot.accounts)
  if (snapshot.contacts) await upsertMany('contact', snapshot.contacts)
  if (snapshot.customers) await upsertMany('customer', snapshot.customers)
  if (snapshot.vendors) await upsertMany('vendor', snapshot.vendors)
  if (snapshot.invoices) await upsertMany('invoice', snapshot.invoices)
  if (snapshot.bills) await upsertMany('bill', snapshot.bills)
  if (snapshot.paymentsReceived) await upsertMany('paymentReceived', snapshot.paymentsReceived)
  if (snapshot.billPayments) await upsertMany('billPayment', snapshot.billPayments)

  console.log('Import complete')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
