import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

describe('migrate_firm_models script', () => {
  afterAll(async () => await prisma.$disconnect());

  test('runs in dry-run and apply without error', () => {
    const dry = execSync('npx ts-node --transpile-only scripts/migrate_firm_models.ts', { cwd: process.cwd(), stdio: 'pipe' }).toString();
    expect(dry).toMatch(/Firm models backfill check/);

    const apply = execSync('npx ts-node --transpile-only scripts/migrate_firm_models.ts --apply', { cwd: process.cwd(), stdio: 'pipe' }).toString();
    expect(apply).toMatch(/Backfill complete/);
  });
});
