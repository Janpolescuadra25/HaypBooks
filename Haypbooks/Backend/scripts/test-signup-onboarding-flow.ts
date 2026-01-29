#!/usr/bin/env tsx
/**
 * Comprehensive test for signup/login/onboarding flow
 * Tests the complete flow from user signup to Tenant/Company creation
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  passed: boolean
  details?: any
  error?: string
}

const results: TestResult[] = []

function addResult(step: string, passed: boolean, details?: any, error?: string) {
  results.push({ step, passed, details, error })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${step}`)
  if (details && Object.keys(details).length > 0) {
    console.log('   Details:', JSON.stringify(details, null, 2))
  }
  if (error) {
    console.log('   Error:', error)
  }
}

async function testOwnerSignupFlow() {
  console.log('\n🧪 Testing OWNER Signup Flow\n')
  
  const testEmail = `test-owner-${Date.now()}@haypbooks.test`
  const testPassword = 'TestPass123!'
  const testName = 'Test Owner User'
  const companyName = 'Test Company LLC'
  
  try {
    // Step 1: Create user (simulating signup completion)
    console.log('Step 1: Creating user with preferredHub = OWNER')
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
        preferredHub: 'OWNER',
        isAccountant: false,
        isEmailVerified: true,
        role: 'owner',
      },
    })
    
    addResult('User created with OWNER WORKSPACE', !!user, {
      userId: user.id,
      email: user.email,
      preferredHub: user.preferredHub,
    })
    
    // Step 2: Verify user has NO tenant initially
    console.log('\nStep 2: Verifying user has no tenant initially')
    const tenantUsers = await prisma.workspaceUser.findMany({
      where: { userId: user.id },
    })
    
    addResult('User has no tenant initially', tenantUsers.length === 0, {
      tenantUserCount: tenantUsers.length,
    })
    
    // Step 3: Simulate onboarding completion by creating Tenant
    console.log('\nStep 3: Simulating onboarding - creating Tenant')
    const tenant = await prisma.workspace.create({
      data: {
        name: testName, // Should use signup name per Grok.9
        workspaceName: testName, // New explicit workspace display name
        username: user.email.split('@')[0],
        trialStartsAt: new Date(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        trialUsed: true,
        maxCompanies: 5,
        companiesCreated: 0,
        status: 'TRIAL',
      },
    })
    
    addResult('Tenant created with name from signup', !!tenant && tenant.name === testName, {
      tenantId: tenant.id,
      tenantName: tenant.name,
      trialStartsAt: tenant.trialStartsAt,
      trialEndsAt: tenant.trialEndsAt,
    })

    addResult('Tenant.workspaceName set from signup', !!tenant && tenant.workspaceName === testName, {
      tenantWorkspaceName: tenant.workspaceName,
    })
    
    // Step 4: Create TenantUser relationship
    console.log('\nStep 4: Creating TenantUser relationship')
    const tenantUser = await prisma.workspaceUser.create({
      data: {
        userId: user.id,
        workspaceId: tenant.id,
        role: 'owner',
        isOwner: true,
        joinedAt: new Date(),
        status: 'ACTIVE',
      },
    })
    
    addResult('TenantUser created with isOwner = true', !!tenantUser && tenantUser.isOwner, {
      tenantUserId: tenantUser.id,
      userId: tenantUser.userId,
      tenantId: tenantUser.tenantId,
      isOwner: tenantUser.isOwner,
    })
    
    // Step 5: Create Company under tenant
    console.log('\nStep 5: Creating Company under tenant')
    const company = await prisma.company.create({
      data: {
        name: companyName,
        workspaceId: tenant.id,
        currency: 'USD',
        isActive: true,
        fiscalYearStart: 1, // January
      },
    })
    
    addResult('Company created under tenant', !!company && company.tenantId === tenant.id, {
      companyId: company.id,
      companyName: company.name,
      tenantId: company.tenantId,
      currency: company.currency,
    })
    
    // Step 6: Verify complete relationship chain
    console.log('\nStep 6: Verifying complete relationship chain')
    const userWithTenants = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        TenantUser: {
          include: {
            tenant: {
              include: {
                companies: true,
              },
            },
          },
        },
      },
    })
    
    const hasValidRelationship = !!(
      userWithTenants &&
      userWithTenants.TenantUser.length > 0 &&
      userWithTenants.TenantUser[0].tenant &&
      userWithTenants.TenantUser[0].tenant.companies.length > 0
    )
    
    addResult('Complete User → TenantUser → Tenant → Company chain verified', hasValidRelationship, {
      userTenants: userWithTenants?.TenantUser.length,
      tenantCompanies: userWithTenants?.TenantUser[0]?.tenant?.companies.length,
    })
    
    // Step 7: Test login simulation (verify user can be found)
    console.log('\nStep 7: Simulating login - verify user can be found')
    const loginUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        TenantUser: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: {
              include: {
                companies: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    })
    
    const canLogin = !!(
      loginUser &&
      loginUser.isEmailVerified &&
      loginUser.workspaceUsers && loginUser.workspaceUsers.length > 0
    )
    
    addResult('User can login and access tenant/companies', canLogin, {
      isEmailVerified: loginUser?.isEmailVerified,
      activeTenants: loginUser?.workspaceUsers?.filter(tu => tu.status === 'ACTIVE').length,
      activeCompanies: loginUser?.workspaceUsers?.[0]?.workspace?.companies.filter(c => c.isActive).length,
    })
    
    // Cleanup
    console.log('\nCleaning up test data...')
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.tenantUser.delete({ 
      where: { 
        workspaceId_userId: {
          workspaceId: tenantUser.workspaceId,
          userId: tenantUser.userId,
        }
      } 
    })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
    console.log('✓ Cleanup complete')
    
  } catch (error: any) {
    addResult('OWNER signup flow', false, undefined, error.message)
    throw error
  }
}

async function testAccountantSignupFlow() {
  console.log('\n🧪 Testing ACCOUNTANT Signup Flow\n')
  
  const testEmail = `test-accountant-${Date.now()}@haypbooks.test`
  const testPassword = 'TestPass123!'
  const testName = 'Test Accountant'
  const firmName = 'Smith & Associates CPA'
  
  try {
    // Step 1: Create user with accountant flag
    console.log('Step 1: Creating user with preferredHub = ACCOUNTANT')
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
        preferredHub: 'ACCOUNTANT',
        isAccountant: true,
        firmName: firmName,
        isEmailVerified: true,
        role: 'accountant',
      },
    })
    
    addResult('Accountant user created with firmName', !!user && user.isAccountant && !!user.firmName, {
      userId: user.id,
      email: user.email,
      preferredHub: user.preferredHub,
      isAccountant: user.isAccountant,
      firmName: user.firmName,
    })
    
    // Step 2: Create firm workspace (Tenant)
    console.log('\nStep 2: Creating firm workspace (Tenant)')
    const tenant = await prisma.workspace.create({
      data: {
        name: firmName, // Firm name as workspace name
        workspaceName: firmName, // Ensure workspace display name is populated
        firmName: firmName, // Also set legacy field
        username: user.email.split('@')[0],
        trialStartsAt: new Date(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialUsed: true,
        maxCompanies: 20, // Accountants can manage multiple clients
        companiesCreated: 0,
        status: 'TRIAL',
      },
    })
    
    addResult('Firm workspace (Tenant) created', !!tenant && tenant.firmName === firmName, {
      tenantId: tenant.id,
      tenantName: tenant.name,
      firmName: tenant.firmName,
    })

    addResult('Tenant.workspaceName set for firm', !!tenant && tenant.workspaceName === firmName, {
      tenantWorkspaceName: tenant.workspaceName,
    })
    
    // Step 3: Link accountant to firm workspace
    console.log('\nStep 3: Linking accountant to firm workspace')
    const tenantUser = await prisma.tenantUser.create({
      data: {
        userId: user.id,
        workspaceId: tenant.id,
        role: 'owner', // Accountant is owner of their firm
        isOwner: true,
        joinedAt: new Date(),
        status: 'ACTIVE',
      },
    })
    
    addResult('Accountant linked to firm workspace', !!tenantUser && tenantUser.isOwner, {
      tenantUserId: tenantUser.id,
      isOwner: tenantUser.isOwner,
    })
    
    // Step 4: Verify accountant can access workspace
    console.log('\nStep 4: Verifying accountant can access workspace')
    const accountantWithWorkspace = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        TenantUser: {
          include: {
            tenant: true,
          },
        },
      },
    })
    
    const hasWorkspace = !!(
      accountantWithWorkspace &&
      accountantWithWorkspace.workspaceUsers && accountantWithWorkspace.workspaceUsers.length > 0 &&
      accountantWithWorkspace.firmName === firmName
    )
    
    addResult('Accountant has firm workspace access', hasWorkspace, {
      userFirmName: accountantWithWorkspace?.firmName,
      tenantFirmName: accountantWithWorkspace?.workspaceUsers?.[0]?.workspace?.firmName,
      activeTenants: accountantWithWorkspace?.workspaceUsers?.length,
    })
    
    // Cleanup
    console.log('\nCleaning up test data...')
    await prisma.tenantUser.delete({ 
      where: { 
        workspaceId_userId: {
          workspaceId: tenantUser.workspaceId,
          userId: tenantUser.userId,
        }
      } 
    })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
    console.log('✓ Cleanup complete')
    
  } catch (error: any) {
    addResult('ACCOUNTANT signup flow', false, undefined, error.message)
    throw error
  }
}

async function testSchemaConsistency() {
  console.log('\n🧪 Testing Schema Consistency\n')
  
  try {
    // Check User table structure
    console.log('Checking User table...')
    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    const hasUserFirmName = userColumns.some(col => col.column_name === 'firmname')
    const hasUserTrialFields = userColumns.some(col => 
      col.column_name === 'trialStartedAt' || col.column_name === 'trialEndsAt'
    )
    
    addResult('User.firmName field exists', hasUserFirmName)
    addResult('User table has NO trial fields', !hasUserTrialFields)
    
    // Check Tenant table structure
    console.log('\nChecking Tenant table...')
    const tenantColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Tenant' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    const hasTenantName = tenantColumns.some(col => col.column_name === 'name')
    const hasTenantFirmName = tenantColumns.some(col => col.column_name === 'firmName' || col.column_name === 'firmname')
    const hasTenantWorkspaceName = tenantColumns.some(col => col.column_name === 'workspace_name' || col.column_name === 'workspaceName')
    const hasTenantTrialFields = tenantColumns.some(col => 
      col.column_name === 'trialStartsAt' || col.column_name === 'trialEndsAt'
    )
    
    addResult('Tenant.name field exists', hasTenantName)
    addResult('Tenant.firmName field exists', hasTenantFirmName)
    addResult('Tenant.workspace_name field exists', hasTenantWorkspaceName)
    addResult('Tenant has trial fields', hasTenantTrialFields)
    
    // Check Company table indexes
    console.log('\nChecking Company table indexes...')
    const companyIndexes = await prisma.$queryRaw<any[]>`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'Company'
      ORDER BY indexname;
    `
    
    const hasTenantIdIndex = companyIndexes.some(idx => 
      idx.indexdef.includes('tenantId')
    )
    const hasTenantIdActiveIndex = companyIndexes.some(idx => 
      idx.indexdef.includes('tenantId') && idx.indexdef.includes('isActive')
    )
    
    addResult('Company has tenantId index', hasTenantIdIndex)
    addResult('Company has composite (tenantId, isActive) index', hasTenantIdActiveIndex)
    
  } catch (error: any) {
    addResult('Schema consistency check', false, undefined, error.message)
    throw error
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  Haypbooks Signup/Onboarding Flow Test Suite            ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  
  try {
    // Test schema consistency first
    await testSchemaConsistency()
    
    // Test OWNER signup flow
    await testOwnerSignupFlow()
    
    // Test ACCOUNTANT signup flow
    await testAccountantSignupFlow()
    
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║  Test Results Summary                                     ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
    
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length
    
    console.log(`\nTotal Tests: ${total}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ❌`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.step}`)
        if (r.error) console.log(`    Error: ${r.error}`)
      })
    }
    
    console.log('\n' + '='.repeat(60))
    console.log(failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed!')
    console.log('='.repeat(60) + '\n')
    
    process.exit(failed > 0 ? 1 : 0)
    
  } catch (error: any) {
    console.error('\n❌ Test suite failed with error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
