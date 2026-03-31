const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const users = await p.user.findMany({ take: 10, select: { id: true, email: true, preferredHub: true, isEmailVerified: true } })
  console.log('Users count:', users.length)
  for (const u of users) {
    console.log(`  User: ${u.email} id=${u.id} hub=${u.preferredHub} verified=${u.isEmailVerified}`)
  }
  
  const onboarding = await p.onboardingData.findMany({ take: 10 })
  console.log('\nOnboardingData count:', onboarding.length)
  
  const ws = await p.workspace.findMany({ take: 5 })
  console.log('\nWorkspaces count:', ws.length)
  for (const w of ws) {
    console.log(`  WS: ${w.id} type=${w.type} owner=${w.ownerUserId}`)
  }
}

main().catch(e => console.error(e.message)).finally(() => p.$disconnect())
