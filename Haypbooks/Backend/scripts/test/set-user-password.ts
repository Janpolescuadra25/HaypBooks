import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  if (!email || !password) {
    console.error('Usage: npx ts-node scripts/test/set-user-password.ts <email> <password>')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found')
    await prisma.$disconnect()
    process.exit(1)
  }

  const updated = await prisma.user.update({ where: { email }, data: { password: hash } as any })
  console.log('Password updated for', updated.email)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })