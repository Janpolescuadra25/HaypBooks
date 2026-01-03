/**
 * Diagnostic script to check user phone verification status
 * Run with: npx ts-node scripts/test/check-phone-verification.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: npx ts-node scripts/test/check-phone-verification.ts <email>')
    process.exit(1)
  }

  console.log(`\n🔍 Checking verification status for: ${email}\n`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      phoneVerifiedAt: true,
      createdAt: true,
      role: true
    }
  })

  if (!user) {
    console.error('❌ User not found')
    process.exit(1)
  }

  const hasPhone = !!user.phone
  const emailVerified = !!user.isEmailVerified
  const phoneVerified = !!user.isPhoneVerified
  const canLogin = hasPhone ? (emailVerified || phoneVerified) : emailVerified

  console.log('📋 User Details:')
  console.log(`   User ID: ${user.id}`)
  console.log(`   Name: ${user.name || '(none)'}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Phone: ${user.phone || '(none)'}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Created: ${user.createdAt}`)
  console.log()

  console.log('✅ Verification Status:')
  console.log(`   Has Phone: ${hasPhone ? 'YES' : 'NO'}`)
  console.log(`   Email Verified: ${emailVerified ? 'YES ✓' : 'NO ✗'}`)
  console.log(`   Phone Verified: ${phoneVerified ? 'YES ✓' : 'NO ✗'}`)
  console.log(`   Phone Verified At: ${user.phoneVerifiedAt || '(not set)'}`)
  console.log()

  console.log('🔐 Login Policy:')
  const policy = hasPhone ? 'OR (email OR phone must be verified)' : 'email must be verified'
  console.log(`   Policy: ${policy}`)
  console.log(`   Can Login: ${canLogin ? 'YES ✓' : 'NO ✗'}`)
  console.log()

  if (!canLogin) {
    console.log('❌ LOGIN WILL FAIL')
    console.log('   Reason: User has not verified any contact method')
    if (hasPhone) {
      console.log('   Solution: User must verify either email OR phone')
    } else {
      console.log('   Solution: User must verify email')
    }
  } else {
    console.log('✅ LOGIN SHOULD SUCCEED')
  }
  console.log()

  await prisma.$disconnect()
}

main().catch(console.error)
