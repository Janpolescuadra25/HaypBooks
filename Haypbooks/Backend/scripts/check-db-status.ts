import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllData() {
  console.log('🔍 Checking database status...')
  console.log('=' .repeat(60))
  
  const userCount = await prisma.user.count()
  const tenantCount = await prisma.tenant.count()
  const companyCount = await prisma.company.count()
  const tenantUserCount = await prisma.tenantUser.count()
  
  console.log(`👥 Users: ${userCount}`)
  console.log(`🏢 Tenants: ${tenantCount}`)
  console.log(`💼 Companies: ${companyCount}`)
  console.log(`🔗 TenantUsers: ${tenantUserCount}`)
  
  if (userCount > 0) {
    console.log('\nRecent 5 users:')
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        createdAt: true,
        onboardingComplete: true
      }
    })
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.onboardingComplete ? '✅' : '⏳'} onboarding)`)
    })
  }
  
  if (companyCount > 0) {
    console.log('\nRecent 5 companies:')
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        tenantId: true,
        createdAt: true
      }
    })
    companies.forEach(c => {
      console.log(`  - ${c.name} (tenantId: ${c.tenantId})`)
    })
  }
  
  await prisma.$disconnect()
}

checkAllData().catch(console.error)
