import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function run() {
  const r: any[] = await prisma.$queryRawUnsafe(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Contact' AND column_name='id'`)
  console.log(r)
}

run().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
