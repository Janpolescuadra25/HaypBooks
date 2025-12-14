import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const snapshot: any = {}
  // Add core tables used by frontend seed
  snapshot.tenants = await prisma.tenant.findMany()
  snapshot.users = await prisma.user.findMany()
  snapshot.accounts = await prisma.account.findMany()
  snapshot.contacts = await prisma.contact.findMany()
  snapshot.customers = await prisma.customer.findMany()
  snapshot.vendors = await prisma.vendor.findMany()
  snapshot.invoices = await prisma.invoice.findMany()
  snapshot.bills = await prisma.bill.findMany()
  snapshot.paymentsReceived = await prisma.paymentReceived.findMany()
  snapshot.billPayments = await prisma.billPayment.findMany()

  const outDir = path.resolve(process.cwd(), 'dev-fixtures')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `mock-db-snapshot-${Date.now()}.json`)
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2))
  console.log('Wrote snapshot to', outFile)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
