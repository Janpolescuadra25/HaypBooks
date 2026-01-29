import { PrismaClient } from '@prisma/client'

async function verifySetup() {
  const prisma = new PrismaClient()

  try {
    console.log('\n🔍 Haypbooks Setup Verification\n')
    console.log('=' .repeat(60))

    // Check database counts
    const userCount = await prisma.user.count()
    const tenantCount = await prisma.workspace.count()
    const companyCount = await prisma.company.count()
    const tenantUserCount = await prisma.workspaceUser.count()
    const onboardingStepCount = await prisma.onboardingStep.count()

    console.log('\n📊 Database Status:')
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   🏢 Tenants: ${tenantCount}`)
    console.log(`   💼 Companies: ${companyCount}`)
    console.log(`   🔗 TenantUsers: ${tenantUserCount}`)
    console.log(`   📋 OnboardingSteps: ${onboardingStepCount}`)

    // Check recent companies
    if (companyCount > 0) {
      const recentCompanies = await prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      console.log('\n✅ Recent Companies:')
      recentCompanies.forEach((company, idx) => {
        console.log(`   ${idx + 1}. ${company.name} (${company.legalName || 'N/A'}) - TenantID: ${company.tenantId}`)
      })
    } else {
      console.log('\n❌ No companies found in database')
    }

    // Check recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        firmName: true,
        createdAt: true,
        isEmailVerified: true
      }
    })

    console.log('\n👤 Recent Users:')
    recentUsers.forEach((user, idx) => {
      const verified = user.isEmailVerified ? '✓' : '✗'
      console.log(`   ${idx + 1}. ${user.email} (${user.firmName || 'N/A'}) [${verified}]`)
    })

    // Configuration check
    console.log('\n⚙️  Configuration:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}`)
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

    console.log('\n' + '=' .repeat(60))
    console.log('\n✅ Setup verification complete!\n')

  } catch (error) {
    console.error('\n❌ Error during verification:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifySetup()
  .catch(console.error)
  .finally(() => process.exit(0))
