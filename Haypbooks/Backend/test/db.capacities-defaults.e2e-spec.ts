import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
const prisma = new PrismaClient()

describe('Plan capacity defaults backfill', () => {
  afterAll(async () => await prisma.$disconnect())

  test('set_default_plan_capacities inserts expected keys', async () => {
    // create a temporary plan
    const plan = await prisma.plan.create({ data: { name: 'Test Pro Plan', type: 'pro', description: 'Test plan for capacities' } })

    // Run the backfill script in apply mode
    execSync('npx ts-node --transpile-only scripts/set_default_plan_capacities.ts --apply', { stdio: 'inherit' })

    // Query capacities for this plan
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT key, value FROM "PlanCapacity" WHERE plan_id = $1::text', plan.id)

    const keys = rows.map(r => r.key)
    // Expect HaypBooks-specific keys plus legacy aliases to be populated
    expect(keys).toEqual(expect.arrayContaining([
      'max_companies','max_active_users','max_invoices_per_month','max_bank_accounts','max_storage_gb','enable_ai_insights',
      'max_accounting_orgs','max_bank_connections'
    ]))

    // cleanup
    await prisma.$executeRawUnsafe('DELETE FROM "PlanCapacity" WHERE plan_id = $1::text', plan.id)
    await prisma.plan.delete({ where: { id: plan.id } })
  })
})
