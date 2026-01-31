import { PrismaClient } from '@prisma/client'
import yargs from 'yargs'
const argv = yargs(process.argv.slice(2)).option('apply', { type: 'boolean', default: false }).argv as any
const prisma = new PrismaClient()

async function main() {
  const apply = argv.apply as boolean
  console.log('\n=== Default Plan Capacities Check ===\n')

  const plans: any[] = await prisma.$queryRawUnsafe('SELECT id, name, type FROM "Plan"')
  if (!plans.length) {
    console.log('No plans found in database; nothing to do.')
    return
  }

  const defaults = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('free')) {
      return [
        { key: 'max_xero_orgs', value: 1 },
        { key: 'max_api_calls_per_month', value: 1000 },
        { key: 'file_storage_mb', value: 50 }
      ]
    }
    if (n.includes('pro')) {
      return [
        { key: 'max_xero_orgs', value: 3 },
        { key: 'max_api_calls_per_month', value: 10000 },
        { key: 'file_storage_mb', value: 1024 }
      ]
    }
    // Default for other business plans
    return [
      { key: 'max_xero_orgs', value: 10 },
      { key: 'max_api_calls_per_month', value: 100000 },
      { key: 'file_storage_mb', value: 10240 }
    ]
  }

  for (const p of plans) {
    const wants = defaults(p.name || p.type || '')
    console.log(`Plan ${p.name} (${p.id}) - checking ${wants.length} capacity keys`)
    for (const w of wants) {
      const existing = await prisma.$queryRawUnsafe('SELECT id, value FROM "PlanCapacity" WHERE plan_id = $1::text AND key = $2', p.id, w.key) as any[]
      if (Array.isArray(existing) && existing.length) {
        console.log(`  - ${w.key} exists (value=${existing[0].value})`)
      } else {
        console.log(`  - would insert ${w.key} = ${w.value}`)
        if (apply) {
          await prisma.$executeRawUnsafe('INSERT INTO "PlanCapacity" (id, plan_id, key, value, created_at) SELECT gen_random_uuid(), $1::text, $2, $3, now() WHERE NOT EXISTS (SELECT 1 FROM "PlanCapacity" WHERE plan_id = $1::text AND key = $2)', p.id, w.key, w.value)
          console.log(`    -> inserted`)
        }
      }
    }
  }

  console.log('\nDone. Run with --apply to create missing capacities.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => await prisma.$disconnect())
