#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('[cleanup] Deleting expired EmailVerificationToken rows...')
    const evt = await prisma.emailVerificationToken.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    console.log(`[cleanup] Deleted ${evt.count} expired EmailVerificationToken rows`)

    console.log('[cleanup] Deleting expired OTP rows...')
    const otp = await prisma.otp.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    console.log(`[cleanup] Deleted ${otp.count} expired OTP rows`)
  } catch (e) {
    console.error('[cleanup] Error:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
