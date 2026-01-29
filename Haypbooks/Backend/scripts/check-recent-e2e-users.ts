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
  
  console.log(`Found ${users.length} recent E2E users:\n`)
  
  for (const user of users) {
    console.log(`📧 ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log(`   Onboarding complete: ${user.onboardingComplete}`)
    console.log(`   Onboarding mode: ${user.onboardingMode || '(not set)'}`)
    console.log(`   workspaceUsers: ${user.workspaceUsers?.length || 0}`)
    
    for (const tu of user.workspaceUsers) {
      console.log(`   - workspaceUser: isOwner=${tu.isOwner}, workspaceId=${tu.workspaceId}`)
      if (tu.workspace) {
        console.log(`     Workspace: ${(tu.workspace as any).workspaceName || tu.workspace.name || '(no name)'} (ID=${tu.workspace.id})`)
        console.log(`     Companies: ${tu.workspace.companies.length}`)
        for (const company of tu.workspace.companies) {
          console.log(`       🏢 ${company.name} (ID=${company.id})`)
        }
      }
    }
    console.log('')
  }
  
  await prisma.$disconnect()
}

checkRecentE2EUsers().catch(console.error)
