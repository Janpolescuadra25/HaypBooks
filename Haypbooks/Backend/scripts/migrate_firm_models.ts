import { PrismaClient } from '@prisma/client';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2)).option('apply', { type: 'boolean', default: false }).argv;
const prisma = new PrismaClient();

async function main() {
  const apply = argv.apply as boolean;

  console.log('\n=== Firm models backfill check ===\n');

  // Count AccountingFirmSubscription rows using raw SQL (robust regardless of generated client types)
  const subs = await prisma.$queryRawUnsafe(`SELECT id, "accountingFirmId", "planId", "workspaceId" FROM "AccountingFirmSubscription"`);
  console.log(`Found ${subs.length} AccountingFirmSubscription rows.`);

  const planIds = Array.from(new Set(subs.map((s: any) => s.planId)));
  console.log(`Distinct plan ids: ${planIds.join(', ') || '<none>'}`);

  // Check existence of FirmPlan by code
  for (const pid of planIds) {
    const r = await prisma.$queryRawUnsafe(`SELECT id FROM "FirmPlan" WHERE code = $1`, pid);
    if (r && r.length) {
      console.log(`Plan already exists for code=${pid} (id=${r[0].id})`);
    } else {
      console.log(`Would create FirmPlan(code=${pid})`);
    }
  }

  // Onboarding progress: check workspaces via raw SQL
  const workspaces = await prisma.$queryRawUnsafe(`SELECT id FROM "Workspace"`);
  let missing = 0;
  for (const w of workspaces) {
    const p = await prisma.$queryRawUnsafe(`SELECT id FROM "FirmOnboardingProgress" WHERE workspace_id = $1::uuid`, w.id);
    if (!p || p.length === 0) missing++;
  }
  console.log(`Workspaces without onboarding progress: ${missing}`);

  if (!apply) {
    console.log('\nRun with --apply to create missing records (dry-run only).');
    return;
  }

  console.log('\nApplying changes (idempotent inserts)...');

  for (const pid of planIds) {
    await prisma.$executeRawUnsafe(`INSERT INTO "FirmPlan" (id, code, name, price_cents, created_at) SELECT gen_random_uuid(), $1, $2, 0, now() WHERE NOT EXISTS (SELECT 1 FROM "FirmPlan" WHERE code = $1)`, pid, pid);
    const r = await prisma.$queryRawUnsafe(`SELECT id FROM "FirmPlan" WHERE code = $1`, pid);
    if (r && r.length) console.log(`FirmPlan ensured for code=${pid} id=${r[0].id}`);
  }

  for (const w of workspaces) {
    await prisma.$executeRawUnsafe(`INSERT INTO "FirmOnboardingProgress" (id, workspace_id, step, meta, updated_at) SELECT gen_random_uuid(), $1::uuid, 0, '{}'::jsonb, now() WHERE NOT EXISTS (SELECT 1 FROM "FirmOnboardingProgress" WHERE workspace_id = $1::uuid)`, w.id);
  }

  console.log('\nBackfill complete.');

  console.log('\nBackfill complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => await prisma.$disconnect());
