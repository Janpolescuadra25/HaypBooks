import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

type WorkspaceRow = {
  id: string
  baseCurrency: string | null
}

function normalizeCurrency(value: unknown): string {
  const code = String(value ?? '').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : 'USD'
}

async function hasColumn(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS exists
  `
  return !!rows?.[0]?.exists
}

async function run() {
  console.info('[BACKFILL-BANK] Starting backfill for empty active workspaces')

  const hasGlAccountId = await hasColumn('BankAccount', 'glAccountId')
  const activeWorkspaces = await prisma.workspace.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, baseCurrency: true },
  })

  let scanned = 0
  let emptyCandidates = 0
  let createdBankAccounts = 0
  let createdCoaAccounts = 0
  let skippedNoCompany = 0
  let skippedNowNonEmpty = 0

  for (const workspace of activeWorkspaces as WorkspaceRow[]) {
    scanned += 1

    const activeBankCount = await prisma.bankAccount.count({
      where: { workspaceId: workspace.id, deletedAt: null },
    })
    if (activeBankCount > 0) continue

    emptyCandidates += 1

    const company = await prisma.company.findFirst({
      where: { workspaceId: workspace.id, isActive: true },
      select: { id: true, currency: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!company) {
      skippedNoCompany += 1
      console.warn(`[BACKFILL-BANK] Skip workspace ${workspace.id}: no active company found`)
      continue
    }

    const currentActiveBankCount = await prisma.bankAccount.count({
      where: { workspaceId: workspace.id, deletedAt: null },
    })
    if (currentActiveBankCount > 0) {
      skippedNowNonEmpty += 1
      continue
    }

    const currency = normalizeCurrency(company.currency ?? workspace.baseCurrency)

    const assetType =
      (await prisma.accountType.findFirst({
        where: {
          OR: [
            { category: 'ASSET' as any },
            { name: { equals: 'ASSET', mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      })) ??
      (await prisma.accountType.create({
        data: { name: 'ASSET', category: 'ASSET' as any },
        select: { id: true },
      }))

    const bankSubType =
      (await prisma.accountSubType.findFirst({
        where: { companyId: company.id, typeId: assetType.id, name: 'BANK' },
        select: { id: true },
      })) ??
      (await prisma.accountSubType.create({
        data: { companyId: company.id, typeId: assetType.id, name: 'BANK' },
        select: { id: true },
      }))

    const existing1010 = await prisma.account.findUnique({
      where: { companyId_code: { companyId: company.id, code: '1010' } },
      select: { id: true },
    })

    const coaAccount = await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: '1010' } },
      update: {
        name: 'Business Checking',
        typeId: assetType.id,
        currency,
        accountSubTypeId: bankSubType.id,
        deletedAt: null,
      },
      create: {
        companyId: company.id,
        code: '1010',
        name: 'Business Checking',
        typeId: assetType.id,
        currency,
        accountSubTypeId: bankSubType.id,
      },
      select: { id: true },
    })

    if (!existing1010) createdCoaAccounts += 1

    await prisma.bankAccount.create({
      data: {
        workspaceId: workspace.id,
        name: 'Business Checking',
        institution: 'Auto Provisioned',
        isDefault: true,
        ...(hasGlAccountId ? { glAccountId: coaAccount.id } : {}),
      },
    })

    createdBankAccounts += 1
    console.info(
      `[BACKFILL-BANK] Workspace ${workspace.id}: created BankAccount + linked COA 1010 for company ${company.id}`,
    )
  }

  console.info('[BACKFILL-BANK] Complete', {
    scanned,
    emptyCandidates,
    createdBankAccounts,
    createdCoaAccounts,
    skippedNoCompany,
    skippedNowNonEmpty,
  })
}

run()
  .catch((err) => {
    console.error('[BACKFILL-BANK] Fatal', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
