// Quick script to inspect users with companyName/firmName and related onboarding steps/companies
// Usage: node ./scripts/query-company-firm.js

const { PrismaClient } = require('@prisma/client')
;(async function main(){
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      where: { OR: [ { companyName: { not: null } }, { firmName: { not: null } } ] },
      select: { id: true, email: true, companyName: true, firmName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    console.log('=== Users with companyName or firmName (latest 50) ===')
    console.log(JSON.stringify(users, null, 2))

    const userIds = users.map(u => u.id)
    if (userIds.length) {
      const steps = await prisma.onboardingStep.findMany({
        where: { userId: { in: userIds } },
        select: { id: true, userId: true, step: true, data: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 200
      })
      console.log('\n=== OnboardingStep rows for those users ===')
      console.log(JSON.stringify(steps, null, 2))
    } else {
      console.log('\nNo users found with companyName or firmName. Skipping onboardingStep query.')
    }

    // Also list recent companies that look like e2e runs
    const recentCompanies = await prisma.company.findMany({
      where: { name: { contains: 'E2E' } },
      select: { id: true, tenantId: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    console.log('\n=== Companies with "E2E" in name (latest 50) ===')
    console.log(JSON.stringify(recentCompanies, null, 2))

  } catch (e) {
    console.error('Query failed:', e)
    process.exitCode = 2
  } finally {
    await require('@prisma/client').PrismaClient.prototype.$disconnect.call(new PrismaClient())
  }
})()
