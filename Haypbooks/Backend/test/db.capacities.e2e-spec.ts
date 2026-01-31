import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

describe('Plan & Workspace capacities', () => {
  afterAll(async () => await prisma.$disconnect())

  test('capacity tables exist', async () => {
    const q = await prisma.$queryRaw<any[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('PlanCapacity','WorkspaceCapacity')
    `
    const found = q.map(r => r.table_name)
    expect(found).toEqual(expect.arrayContaining(['PlanCapacity','WorkspaceCapacity']))
  })
})
