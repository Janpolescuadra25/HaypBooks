import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import { Client } from 'pg'
import { runWithContext } from '../../src/shared/async-context'

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

describe('Row-Level Security enforcement', () => {
  const prisma = new PrismaClient()
  let workspaceId: string
  let companyAId: string
  let companyBId: string

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    // Ensure clean test DB with migrations + seed
    execSync('npm run test:setup-db', { cwd: BACKEND_DIR, stdio: 'inherit' })

    await prisma.$connect()

    // Create two workspaces/companies
    const wsA = await prisma.workspace.create({ data: { ownerUserId: '00000000-0000-0000-0000-000000000001' } })
    const wsB = await prisma.workspace.create({ data: { ownerUserId: '00000000-0000-0000-0000-000000000002' } })

    workspaceId = wsA.id
    const cA = await prisma.company.create({ data: { workspaceId: wsA.id, name: 'RLS Co A', industry: 'TEST', currency: 'USD' } })
    const cB = await prisma.company.create({ data: { workspaceId: wsB.id, name: 'RLS Co B', industry: 'TEST', currency: 'USD' } })

    companyAId = cA.id
    companyBId = cB.id

    // Seed one account per company (via direct prisma, bypassing service)
    await prisma.account.create({ data: { companyId: cA.id, code: '9000', name: 'RLS A', typeId: 1, normalSide: 'DEBIT' } })
    await prisma.account.create({ data: { companyId: cB.id, code: '9001', name: 'RLS B', typeId: 1, normalSide: 'DEBIT' } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('prevents reading another company account even with an open query', async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()

    try {
      // Set session session variable to company A
      await client.query(`SET LOCAL haypbooks.company_id = $1`, [companyAId])

      // Query accounts without applying any company filter (should be blocked by RLS)
      const res = await client.query('SELECT code, companyId FROM public."Account" WHERE code = $1', ['9001'])
      expect(res.rows).toHaveLength(0)
    } finally {
      await client.end()
    }
  })

  it('sets session variables from request context for Prisma queries', async () => {
    // When we run within a request context, the Prisma middleware should set
    // `haypbooks.company_id` before executing queries.
    const account = await runWithContext({ companyId: companyAId }, async () => {
      return prisma.account.findFirst({ where: { code: '9001' } })
    })
    expect(account).toBeNull()

    const ourAccount = await runWithContext({ companyId: companyAId }, async () => {
      return prisma.account.findFirst({ where: { code: '9000' } })
    })
    expect(ourAccount?.companyId).toBe(companyAId)
  })

  it('enforces workspace isolation via RLS (workspaceId session var)', async () => {
    const wsA = await prisma.workspace.create({ data: { ownerUserId: '00000000-0000-0000-0000-000000000003' } })
    const wsB = await prisma.workspace.create({ data: { ownerUserId: '00000000-0000-0000-0000-000000000004' } })
    const creatorIdA = '00000000-0000-0000-0000-000000000005'
    const creatorIdB = '00000000-0000-0000-0000-000000000006'

    const taskA = await prisma.task.create({ data: { workspaceId: wsA.id, createdById: creatorIdA, title: 'RLS Task A' } })
    const taskB = await prisma.task.create({ data: { workspaceId: wsB.id, createdById: creatorIdB, title: 'RLS Task B' } })

    // Ensure user session var maps to createdById for user-scoped RLS
    const foundByCreator = await runWithContext({ userId: creatorIdA }, async () => {
      return prisma.task.findFirst({ where: { id: taskB.id } })
    })
    expect(foundByCreator).toBeNull()

    const ourUserTask = await runWithContext({ userId: creatorIdA }, async () => {
      return prisma.task.findFirst({ where: { id: taskA.id } })
    })
    expect(ourUserTask?.createdById).toBe(creatorIdA)

    const found = await runWithContext({ workspaceId: wsA.id }, async () => {
      // intentionally do not filter by workspace to ensure RLS blocks the other task
      return prisma.task.findFirst({ where: { id: taskB.id } })
    })
    expect(found).toBeNull()

    const ourWorkspaceTask = await runWithContext({ workspaceId: wsA.id }, async () => {
      return prisma.task.findFirst({ where: { id: taskA.id } })
    })
    expect(ourWorkspaceTask?.workspaceId).toBe(wsA.id)
  })
})
