import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOnboardingSteps() {
  console.log('🔍 Checking onboarding steps data...')
  console.log('=' .repeat(60))
  
  // Get recent users who haven't completed onboarding
  const users = await prisma.user.findMany({
    where: {
      onboardingComplete: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3,
    select: {
      id: true,
      email: true,
      createdAt: true,
      onboardingComplete: true
    }
  })
  
  console.log(`Found ${users.length} users with incomplete onboarding:\n`)
  
  for (const user of users) {
    console.log(`📧 ${user.email}`)
    console.log(`   ID: ${user.id}`)
    
    // Check if they have onboarding data
    const steps = await prisma.onboardingStep.findMany({
      where: { userId: user.id }
    })
    
    if (steps.length > 0) {
      console.log(`   ✅ Has ${steps.length} onboarding steps`)
      
      const businessStep = steps.find(s => s.step === 'business')
      if (businessStep) {
        const data = businessStep.data as any
        console.log(`   Business name: ${data?.businessName || '(not set)'}`)
        console.log(`   Company name: ${data?.companyName || '(not set)'}`)
        console.log(`   Legal name: ${data?.legalBusinessName || '(not set)'}`)
        console.log(`   Business type: ${data?.businessType || '(not set)'}`)
        console.log(`   Country: ${data?.country || '(not set)'}`)
      } else {
        console.log(`   ⚠️  No business step found`)
      }
    } else {
      console.log(`   ❌ No onboarding steps found`)
    }
    console.log('')
  }
  
  await prisma.$disconnect()
}

checkOnboardingSteps().catch(console.error)
