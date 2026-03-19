import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const r = await prisma.$queryRawUnsafe('SELECT gen_random_uuid()')
    console.log('gen_random_uuid ok:', r)
  } catch (e) {
    console.error('gen_random_uuid error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e=>{console.error(e);process.exit(1)})
