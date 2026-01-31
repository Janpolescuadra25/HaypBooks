import { PrismaClient } from '@prisma/client'
import yargs from 'yargs'
const argv = yargs(process.argv.slice(2)).option('apply', { type: 'boolean', default: false }).argv as any
const prisma = new PrismaClient()

async function main() {
  const apply = argv.apply as boolean
  console.log('\n=== HaypBooks Plan Capacities Check ===\n')

  const plans: any[] = await prisma.$queryRawUnsafe('SELECT id, name, type FROM "Plan"')
  if (!plans.length) {
    console.log('No plans found in database; nothing to do.')
    return
  }

  const defaults = (name: string) => {
    const n = (name || '').toLowerCase()

    // Trial / Free
    if (n.includes('trial') || n.includes('free')) {
      return [
        { key: 'max_companies', value: 1 },
        { key: 'max_accounting_orgs', value: 1 }, // legacy alias
        { key: 'max_active_users', value: 3 },
        { key: 'max_invoices_per_month', value: 100 },
        { key: 'max_bank_accounts', value: 2 },
        { key: 'max_storage_gb', value: 1 },
        { key: 'file_storage_mb', value: 50 }, // legacy
        { key: 'max_invoice_templates', value: 5 }, // legacy
        { key: 'max_contacts', value: 500 },
        { key: 'max_api_calls_per_month', value: 1000 },
        { key: 'enable_multi_company', value: false },
        { key: 'enable_payroll', value: false },
        { key: 'enable_ph_tax_compliance', value: false },
        { key: 'enable_ai_insights', value: false },
        { key: 'enable_fixed_assets', value: false },
        { key: 'enable_projects', value: false }
      ]
    }

    // Starter
    if (n.includes('starter')) {
      return [
        { key: 'max_companies', value: 3 },
        { key: 'max_accounting_orgs', value: 3 },
        { key: 'max_active_users', value: 10 },
        { key: 'max_invoices_per_month', value: 1000 },
        { key: 'max_bank_accounts', value: 5 },
        { key: 'max_storage_gb', value: 10 },
        { key: 'file_storage_mb', value: 1024 },
        { key: 'max_invoice_templates', value: 50 },
        { key: 'max_contacts', value: 5000 },
        { key: 'max_api_calls_per_month', value: 10000 },
        { key: 'enable_multi_company', value: true },
        { key: 'enable_payroll', value: false },
        { key: 'enable_ph_tax_compliance', value: false },
        { key: 'enable_ai_insights', value: false },
        { key: 'enable_fixed_assets', value: true },
        { key: 'enable_projects', value: true }
      ]
    }

    // Professional
    if (n.includes('professional') || n.includes('pro')) {
      return [
        { key: 'max_companies', value: 10 },
        { key: 'max_accounting_orgs', value: 10 },
        { key: 'max_active_users', value: -1 }, // -1 = unlimited
        { key: 'max_invoices_per_month', value: 10000 },
        { key: 'max_bank_accounts', value: 20 },
        { key: 'max_storage_gb', value: 50 },
        { key: 'file_storage_mb', value: 10240 },
        { key: 'max_invoice_templates', value: 200 },
        { key: 'max_contacts', value: 20000 },
        { key: 'max_api_calls_per_month', value: 100000 },
        { key: 'enable_multi_company', value: true },
        { key: 'enable_payroll', value: true },
        { key: 'enable_ph_tax_compliance', value: true },
        { key: 'enable_ai_insights', value: true },
        { key: 'enable_fixed_assets', value: true },
        { key: 'enable_projects', value: true }
      ]
    }

    // Enterprise
    if (n.includes('enterprise')) {
      return [
        { key: 'max_companies', value: 50 },
        { key: 'max_accounting_orgs', value: 50 },
        { key: 'max_active_users', value: -1 }, // unlimited
        { key: 'max_invoices_per_month', value: -1 }, // unlimited
        { key: 'max_bank_accounts', value: -1 }, // unlimited
        { key: 'max_storage_gb', value: 500 },
        { key: 'file_storage_mb', value: 102400 },
        { key: 'max_invoice_templates', value: -1 },
        { key: 'max_contacts', value: -1 },
        { key: 'max_api_calls_per_month', value: -1 },
        { key: 'enable_multi_company', value: true },
        { key: 'enable_payroll', value: true },
        { key: 'enable_ph_tax_compliance', value: true },
        { key: 'enable_ai_insights', value: true },
        { key: 'enable_fixed_assets', value: true },
        { key: 'enable_projects', value: true }
      ]
    }

    // Fallback: conservative HaypBooks defaults
    return [
      { key: 'max_companies', value: 3 },
      { key: 'max_accounting_orgs', value: 3 },
      { key: 'max_active_users', value: 10 },
      { key: 'max_invoices_per_month', value: 1000 },
      { key: 'max_bank_accounts', value: 5 },
      { key: 'max_storage_gb', value: 10 },
      { key: 'file_storage_mb', value: 1024 },
      { key: 'max_invoice_templates', value: 50 },
      { key: 'max_contacts', value: 5000 },
      { key: 'max_api_calls_per_month', value: 10000 },
      { key: 'enable_multi_company', value: true },
      { key: 'enable_payroll', value: false },
      { key: 'enable_ph_tax_compliance', value: false },
      { key: 'enable_ai_insights', value: false },
      { key: 'enable_fixed_assets', value: true },
      { key: 'enable_projects', value: true }
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

  console.log('\nDone. Run with --apply to insert HaypBooks default capacities.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => await prisma.$disconnect())
