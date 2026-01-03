import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx ts-node scripts/test/set-user-phone-verified.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found')
    await prisma.$disconnect()
    process.exit(1)
  }

  const updated = await prisma.user.update({ where: { email }, data: { isPhoneVerified: true, phoneVerifiedAt: new Date() } as any })
  console.log('Updated', { id: updated.id, email: updated.email, isPhoneVerified: updated.isPhoneVerified, phoneVerifiedAt: updated.phoneVerifiedAt })
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
