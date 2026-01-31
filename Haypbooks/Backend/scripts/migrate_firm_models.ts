import { PrismaClient } from '@prisma/client';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2)).option('apply', { type: 'boolean', default: false }).argv;
const prisma = new PrismaClient();

async function main() {
  const apply = argv.apply as boolean;

  console.log('\n=== Firm models backfill check ===\n');

  // Count AccountingFirmSubscription rows
  const subs = await prisma.accountingFirmSubscription.findMany({ select: { id: true, accountingFirmId: true, planId: true, workspaceId: true } });

  console.log(`Found ${subs.length} AccountingFirmSubscription rows.`);

  const planIds = Array.from(new Set(subs.map(s => s.planId)));
  console.log(`Distinct plan ids: ${planIds.join(', ') || '<none>'}`);

  // Dry-run: show what we'd create
  for (const pid of planIds) {
    const existing = await prisma.firmPlan.findUnique({ where: { code: pid } }).catch(() => null);
    if (existing) {
      console.log(`Plan already exists for code=${pid} (id=${existing.id})`);
    } else {
      console.log(`Would create FirmPlan(code=${pid})`);
    }
  }

  // Onboarding progress: check workspaces
  const workspaces = await prisma.workspace.findMany({ select: { id: true } });
  let missing = 0;
  for (const w of workspaces) {
    const p = await prisma.firmOnboardingProgress.findUnique({ where: { workspaceId: w.id } }).catch(() => null);
    if (!p) missing++;
  }
  console.log(`Workspaces without onboarding progress: ${missing}`);

  if (!apply) {
    console.log('\nRun with --apply to create missing records (dry-run only).');
    return;
  }

  console.log('\nApplying changes...');

  for (const pid of planIds) {
    const existing = await prisma.firmPlan.findUnique({ where: { code: pid } }).catch(() => null);
    if (!existing) {
      const created = await prisma.firmPlan.create({ data: { code: pid, name: pid, priceCents: 0 } });
      console.log(`Created FirmPlan id=${created.id} code=${created.code}`);
    }
  }

  for (const w of workspaces) {
    const p = await prisma.firmOnboardingProgress.findUnique({ where: { workspaceId: w.id } }).catch(() => null);
    if (!p) {
      const created = await prisma.firmOnboardingProgress.create({ data: { workspaceId: w.id } });
      console.log(`Created FirmOnboardingProgress for workspace ${w.id}`);
    }
  }

  console.log('\nBackfill complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => await prisma.$disconnect());
