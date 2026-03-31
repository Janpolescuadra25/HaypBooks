const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const users = await p.user.findMany({ take: 10, select: { id: true, email: true, onboardingComplete: true, ownerOnboardingComplete: true, accountantOnboardingComplete: true, preferredHub: true } })
  console.log('Users count:', users.length)
  for (const u of users) {
    console.log(`  User: ${u.email} id=${u.id} onboarding=${u.onboardingComplete} ownerOnboard=${u.ownerOnboardingComplete} acctOnboard=${u.accountantOnboardingComplete} hub=${u.preferredHub}`)
  }
}

main().catch(e => console.error(e.message)).finally(() => p.$disconnect())
