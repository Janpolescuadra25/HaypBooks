import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOnboardingData() {
  const email = 'e2e-onboarding-1768132568174@haypbooks.test'
  
  console.log(`🔍 Checking data for: ${email}`)
  console.log('=' .repeat(60))
  
  // Check User
  const user = await prisma.user.findUnique({
    where: { email },
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
  
  if (!user) {
    console.log('❌ User not found')
    await prisma.$disconnect()
    return
  }
  
  console.log(`✅ User found: ID=${user.id}, email=${user.email}`)
  console.log(`   Onboarding complete: ${user.onboardingComplete}`)
  console.log(`   Onboarding mode: ${user.onboardingMode}`)
  console.log(`   TenantUsers count: ${user.TenantUser.length}`)
  
  if (user.TenantUser.length === 0) {
    console.log('❌ No TenantUser relationships found')
    await prisma.$disconnect()
    return
  }
  
  for (const tu of user.TenantUser) {
    console.log(`\n📋 TenantUser: isOwner=${tu.isOwner}, tenantId=${tu.tenantId}`)
    
    if (tu.tenant) {
      console.log(`   ✅ Tenant: ID=${tu.tenant.id}, name=${tu.tenant.name || '(no name)'}`)
      console.log(`   Companies: ${tu.tenant.companies.length}`)
      
      for (const company of tu.tenant.companies) {
        console.log(`   🏢 Company: ID=${company.id}, name=${company.name}`)
        console.log(`      Legal name: ${company.legalName || '(none)'}`)
        console.log(`      Country: ${company.country || '(none)'}`)
        console.log(`      Business type: ${company.businessType || '(none)'}`)
      }
    } else {
      console.log(`   ❌ Tenant not found for tenantId=${tu.tenantId}`)
    }
  }
  
  await prisma.$disconnect()
}

checkOnboardingData().catch(console.error)
