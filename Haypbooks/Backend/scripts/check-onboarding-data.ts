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
      workspaceUsers: {
        include: {
          workspace: {
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
  console.log(`   workspaceUsers count: ${user.workspaceUsers?.length || 0}`)
  
  if (!user.workspaceUsers || user.workspaceUsers.length === 0) {
    console.log('❌ No workspaceUsers relationships found')
    await prisma.$disconnect()
    return
  }
  
  for (const tu of user.workspaceUsers) {
    console.log(`\n📋 workspaceUser: isOwner=${tu.isOwner}, workspaceId=${tu.workspaceId}`)
    
    if (tu.workspace) {
      console.log(`   ✅ Workspace: ID=${tu.workspace.id}, workspaceName=${(tu.workspace as any).workspaceName || tu.workspace.name || '(no name)'}`)
      console.log(`   Companies: ${tu.workspace.companies.length}`)
      
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
