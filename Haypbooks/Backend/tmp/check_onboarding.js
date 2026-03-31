const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const onboarding = await p.onboardingData.findMany({ take: 5 })
  console.log('OnboardingData count:', onboarding.length)
  console.log(JSON.stringify(onboarding, null, 2))

  const workspaces = await p.workspace.findMany({ take: 5, include: { companies: true, practices: true } })
  console.log('\nWorkspaces count:', workspaces.length)
  for (const ws of workspaces) {
    console.log(`  Workspace: ${ws.id} type=${ws.type} owner=${ws.ownerUserId} companies=${ws.companies.length} practices=${ws.practices.length}`)
  }
}

main().catch(e => console.error(e.message)).finally(() => p.$disconnect())
