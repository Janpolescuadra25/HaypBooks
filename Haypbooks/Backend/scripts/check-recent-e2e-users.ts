import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRecentE2EUsers() {
  console.log('🔍 Finding recent E2E test users...')
  console.log('=' .repeat(60))
  
  // Find all e2e users
  const users = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'e2e-onboarding-'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      TenantUser: {
        include: {
          tenant: {
            include: {
              companies: true
            }
          }
        }
      }
    }
  })
  
  console.log(`Found ${users.length} recent E2E users:\n`)
  
  for (const user of users) {
    console.log(`📧 ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log(`   Onboarding complete: ${user.onboardingComplete}`)
    console.log(`   Onboarding mode: ${user.onboardingMode || '(not set)'}`)
    console.log(`   TenantUsers: ${user.TenantUser.length}`)
    
    for (const tu of user.TenantUser) {
      console.log(`   - TenantUser: isOwner=${tu.isOwner}, tenantId=${tu.tenantId}`)
      if (tu.tenant) {
        console.log(`     Tenant: ${tu.tenant.name || '(no name)'} (ID=${tu.tenant.id})`)
        console.log(`     Companies: ${tu.tenant.companies.length}`)
        for (const company of tu.tenant.companies) {
          console.log(`       🏢 ${company.name} (ID=${company.id})`)
        }
      }
    }
    console.log('')
  }
  
  await prisma.$disconnect()
}

checkRecentE2EUsers().catch(console.error)
