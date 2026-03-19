import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import { ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../src/repositories/prisma/prisma.service'
import { AccountingRepository } from '../../src/accounting/accounting.repository'
import { AccountingService } from '../../src/accounting/accounting.service'

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

describe('Company isolation (multi-tenant)', () => {
  const prisma = new PrismaClient()
  const prismaService = new PrismaService()
  const repo = new AccountingRepository(prismaService as any)
  const svc = new AccountingService(repo, prismaService as any)

  let userA: any
  let userB: any
  let workspaceA: any
  let workspaceB: any
  let companyA: any
  let companyB: any

  beforeAll(async () => {
    // Ensure a clean test database
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

    await prisma.$connect()
    // Ensure core account types exist for COA seeding
    for (const [id, name, normalSide] of [
      [1, 'ASSET', 'DEBIT'],
      [2, 'EXPENSE', 'DEBIT'],
      [3, 'INCOME', 'CREDIT'],
      [4, 'LIABILITY', 'CREDIT'],
      [5, 'EQUITY', 'CREDIT'],
    ] as [number, string, string][]) {
      await prisma.accountType.upsert({
        where: { id },
        create: { id, name, normalSide: normalSide as any },
        update: { normalSide: normalSide as any },
      })
    }

    // Create two separate workspaces (tenants)
    userA = await prisma.user.create({ data: { name: 'User A', email: `isolate-a+${Date.now()}@test`, password: 'x' } })
    userB = await prisma.user.create({ data: { name: 'User B', email: `isolate-b+${Date.now()}@test`, password: 'x' } })

    workspaceA = await prisma.workspace.create({ data: { ownerUserId: userA.id } })
    workspaceB = await prisma.workspace.create({ data: { ownerUserId: userB.id } })

    // Create minimal role for each workspace and attach users
    const roleA = await prisma.role.create({ data: { workspaceId: workspaceA.id, name: 'OWNER' } })
    const roleB = await prisma.role.create({ data: { workspaceId: workspaceB.id, name: 'OWNER' } })

    await prisma.workspaceUser.create({ data: { workspaceId: workspaceA.id, userId: userA.id, roleId: roleA.id, isOwner: true } })
    await prisma.workspaceUser.create({ data: { workspaceId: workspaceB.id, userId: userB.id, roleId: roleB.id, isOwner: true } })

    companyA = await prisma.company.create({ data: { workspaceId: workspaceA.id, name: 'Comp A', industry: 'TEST', currency: 'USD' } })
    companyB = await prisma.company.create({ data: { workspaceId: workspaceB.id, name: 'Comp B', industry: 'TEST', currency: 'USD' } })
  }, 120000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('prevents cross-company account visibility', async () => {
    // Trigger seeding for company A and B
    const accountsA = await svc.listAccounts(userA.id, companyA.id)
    const accountsB = await svc.listAccounts(userB.id, companyB.id)

    expect(accountsA.length).toBeGreaterThan(0)
    expect(accountsB.length).toBeGreaterThan(0)

    // Create a unique account in company B
    const uniqueCode = `9999`
    await svc.createAccount(userB.id, companyB.id, {
      code: uniqueCode,
      name: 'Isolation Test',
      typeId: 1, // ASSET
    })

    const updatedA = await svc.listAccounts(userA.id, companyA.id)
    const updatedB = await svc.listAccounts(userB.id, companyB.id)

    expect(updatedA.some(a => a.code === uniqueCode)).toBe(false)
    expect(updatedB.some(a => a.code === uniqueCode)).toBe(true)

    // Ensure user A cannot access company B's accounts
    await expect(svc.listAccounts(userA.id, companyB.id)).rejects.toThrow(ForbiddenException)
  }, 200000)
})
