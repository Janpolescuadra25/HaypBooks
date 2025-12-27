import { PrismaClient } from '@prisma/client'
import { hmacPhone } from '../../src/utils/hmac.util'

async function main() {
  const prisma = new PrismaClient()
  if (!process.env.HMAC_KEY) {
    console.error('HMAC_KEY is required to backfill phone_hmac')
    throw new Error('HMAC_KEY not set')
  }

  const batchSize = 100
  let offset = 0
  while (true) {
    const where: any = { phone: { not: null }, phoneHmac: null }
    const users = await prisma.user.findMany({ where, take: batchSize, skip: offset } as any)
    if (!users.length) break

    for (const u of users) {
      try {
        const normalized = u.phone // assume existing users are normalized; if not, we could re-normalize using phone.util
        if (normalized) {
          const h = hmacPhone(normalized)
          await prisma.user.update({ where: { id: u.id }, data: { phoneHmac: h } } as any)
          console.log(`Updated user ${u.email} (${u.id})`)
        }
      } catch (e) {
        console.error('Failed to update user', u.id, e?.message || e)
      }
    }

    offset += users.length
  }

  await prisma.$disconnect()
  console.log('Backfill complete')
}

main().catch((e) => { console.error(e); process.exit(1) })
