import { PrismaClient } from '@prisma/client'
import { hmacPhone } from '../../src/utils/hmac.util'

async function main() {
  const prisma = new PrismaClient()
  if (!process.env.HMAC_KEY) {
    console.error('HMAC_KEY is required to backfill phone_hmac')
    process.exit(1)
  }

  const batchSize = 100
  let offset = 0
  while (true) {
    const users = await prisma.user.findMany({ where: { phone: { not: null }, phoneHmac: null }, take: batchSize, skip: offset })
    if (!users.length) break

    for (const u of users) {
      try {
        const normalized = u.phone // assume existing users are normalized; if not, we could re-normalize using phone.util
        if (normalized) {
          const h = hmacPhone(normalized)
          await prisma.user.update({ where: { id: u.id }, data: { phoneHmac: h } })
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
