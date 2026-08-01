import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AccountingService } from '../accounting/accounting.service'

export type HealthSeverity = 'PASS' | 'WARNING' | 'ERROR'

export interface LedgerHealthCheck {
  id: string
  name: string
  severity: HealthSeverity
  description: string
  count?: number
  affectedItems?: { id: string; label: string }[]
}

export interface LedgerHealthResponse {
  checkedAt: string
  summary: {
    total: number
    passed: number
    warnings: number
    errors: number
  }
  checks: LedgerHealthCheck[]
}

@Injectable()
export class LedgerHealthService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
  ) {}

  async checkLedgerHealth(userId: string, companyId: string): Promise<LedgerHealthResponse> {
    await this.accountingService.assertCompanyAccessPublic(userId, companyId)
    const checks: LedgerHealthCheck[] = []

    // Check 1: Trial Balance
    try {
      const tb = await this.accountingService.getTrialBalance(userId, companyId)
      if (tb.balanced) {
        checks.push({
          id: 'trial-balance',
          name: 'Trial Balance',
          severity: 'PASS',
          description: 'Total debits equal total credits',
        })
      } else {
        checks.push({
          id: 'trial-balance',
          name: 'Trial Balance',
          severity: 'ERROR',
          description: `Trial balance is out of balance. Debits: ${tb.totalDebits}, Credits: ${tb.totalCredits}`,
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'trial-balance',
        name: 'Trial Balance',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 2: Unposted Journal Entries
    try {
      const count = await this.prisma.journalEntry.count({
        where: { companyId, postingStatus: 'DRAFT', deletedAt: null },
      })
      if (count === 0) {
        checks.push({
          id: 'unposted-entries',
          name: 'Unposted Journal Entries',
          severity: 'PASS',
          description: 'All journal entries are posted',
        })
      } else {
        const items = await this.prisma.journalEntry.findMany({
          where: { companyId, postingStatus: 'DRAFT', deletedAt: null },
          take: 10,
          select: { id: true, entryNumber: true, description: true },
        })
        checks.push({
          id: 'unposted-entries',
          name: 'Unposted Journal Entries',
          severity: 'WARNING',
          description: `${count} journal entr${count === 1 ? 'y' : 'ies'} in DRAFT status`,
          count,
          affectedItems: items.map(j => ({ id: j.id, label: j.entryNumber || j.description || j.id })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'unposted-entries',
        name: 'Unposted Journal Entries',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 3: Unbalanced Journal Entries
    try {
      const rows: any[] = await this.prisma.$queryRaw`
        SELECT "journalId", SUM("debit") as "totalDebit", SUM("credit") as "totalCredit"
        FROM "JournalEntryLine"
        WHERE "companyId" = ${companyId}
          AND "journalId" IN (
            SELECT id FROM "JournalEntry"
            WHERE "companyId" = ${companyId}
              AND "postingStatus" = 'POSTED'
              AND "deletedAt" IS NULL
          )
        GROUP BY "journalId"
        HAVING ABS(SUM("debit") - SUM("credit")) > 0.0001
      `
      if (rows.length === 0) {
        checks.push({
          id: 'unbalanced-entries',
          name: 'Unbalanced Journal Entries',
          severity: 'PASS',
          description: 'All posted entries are balanced',
        })
      } else {
        const ids = rows.map((r: any) => r.journalId)
        const entries = await this.prisma.journalEntry.findMany({
          where: { id: { in: ids } },
          select: { id: true, entryNumber: true, description: true },
        })
        checks.push({
          id: 'unbalanced-entries',
          name: 'Unbalanced Journal Entries',
          severity: 'ERROR',
          description: `${rows.length} posted journal entr${rows.length === 1 ? 'y' : 'ies'} have unequal debits and credits`,
          count: rows.length,
          affectedItems: entries.map(e => ({ id: e.id, label: e.entryNumber || e.description || e.id })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'unbalanced-entries',
        name: 'Unbalanced Journal Entries',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 4: Account Balance Mismatch (drift check, first 50 accounts)
    try {
      const accounts = await this.prisma.account.findMany({
        where: { companyId, isActive: true },
        take: 50,
        select: { id: true, code: true, name: true, balance: true, normalSide: true },
      })
      if (accounts.length === 0) {
        checks.push({
          id: 'balance-drift',
          name: 'Account Balance Mismatch',
          severity: 'PASS',
          description: 'No active accounts to check',
        })
      } else {
        const mismatched: { id: string; label: string; drift: number }[] = []
        for (const acct of accounts) {
          const result: any[] = await this.prisma.$queryRaw`
            SELECT
              CASE
                WHEN a."normalSide" = 'CREDIT' THEN
                  SUM(l."credit") - SUM(l."debit")
                ELSE
                  SUM(l."debit") - SUM(l."credit")
              END as "computedBalance"
            FROM "JournalEntryLine" l
            JOIN "JournalEntry" j ON j.id = l."journalId"
            JOIN "Account" a ON a.id = l."accountId"
            WHERE l."accountId" = ${acct.id}
              AND j."postingStatus" = 'POSTED'
              AND j."deletedAt" IS NULL
          `
          const computed = Number(result[0]?.computedBalance ?? 0)
          const stored = Number(acct.balance)
          if (Math.abs(computed - stored) > 0.01) {
            mismatched.push({ id: acct.id, label: `${acct.code} — ${acct.name}`, drift: computed - stored })
          }
        }
        if (mismatched.length === 0) {
          checks.push({
            id: 'balance-drift',
            name: 'Account Balance Mismatch',
            severity: 'PASS',
            description: `All ${accounts.length} checked accounts have correct balances`,
          })
        } else {
          checks.push({
            id: 'balance-drift',
            name: 'Account Balance Mismatch',
            severity: 'WARNING',
            description: `${mismatched.length} account${mismatched.length === 1 ? '' : 's'} have stored balances that differ from computed journal line totals`,
            count: mismatched.length,
            affectedItems: mismatched.slice(0, 10).map(m => ({ id: m.id, label: `${m.label} (drift: ${m.drift.toFixed(2)})` })),
          })
        }
      }
    } catch (err: any) {
      checks.push({
        id: 'balance-drift',
        name: 'Account Balance Mismatch',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 5: Inactive Accounts with Transactions
    try {
      const accounts = await this.prisma.account.findMany({
        where: {
          companyId,
          isActive: false,
          journalLines: {
            some: {
              journal: { postingStatus: 'POSTED', deletedAt: null },
            },
          },
        },
        select: { id: true, code: true, name: true },
        take: 20,
      })
      if (accounts.length === 0) {
        checks.push({
          id: 'inactive-accounts',
          name: 'Inactive Accounts with Transactions',
          severity: 'PASS',
          description: 'No inactive accounts have posted transactions',
        })
      } else {
        checks.push({
          id: 'inactive-accounts',
          name: 'Inactive Accounts with Transactions',
          severity: 'WARNING',
          description: `${accounts.length} inactive account${accounts.length === 1 ? '' : 's'} have posted journal entries`,
          count: accounts.length,
          affectedItems: accounts.map(a => ({ id: a.id, label: `${a.code} — ${a.name}` })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'inactive-accounts',
        name: 'Inactive Accounts with Transactions',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 6: Voided Entries Still Referenced
    try {
      const entries = await this.prisma.journalEntry.findMany({
        where: {
          companyId,
          postingStatus: 'VOIDED',
          deletedAt: null,
          transactionSource: { not: null },
          sourceReferenceId: { not: null },
        },
        select: { id: true, entryNumber: true, description: true, transactionSource: true },
        take: 20,
      })
      if (entries.length === 0) {
        checks.push({
          id: 'voided-referenced',
          name: 'Voided Entries Still Referenced',
          severity: 'PASS',
          description: 'No voided entries are linked to source documents',
        })
      } else {
        checks.push({
          id: 'voided-referenced',
          name: 'Voided Entries Still Referenced',
          severity: 'WARNING',
          description: `${entries.length} voided entr${entries.length === 1 ? 'y' : 'ies'} still linked to source documents`,
          count: entries.length,
          affectedItems: entries.map(e => ({ id: e.id, label: e.entryNumber || e.description || e.id })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'voided-referenced',
        name: 'Voided Entries Still Referenced',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 7: Duplicate Entry Numbers
    try {
      const rows: any[] = await this.prisma.$queryRaw`
        SELECT "entryNumber", COUNT(*)::int as "cnt"
        FROM "JournalEntry"
        WHERE "companyId" = ${companyId}
          AND "entryNumber" IS NOT NULL
          AND "deletedAt" IS NULL
        GROUP BY "entryNumber"
        HAVING COUNT(*) > 1
      `
      if (rows.length === 0) {
        checks.push({
          id: 'duplicate-entry-numbers',
          name: 'Duplicate Entry Numbers',
          severity: 'PASS',
          description: 'All entry numbers are unique',
        })
      } else {
        checks.push({
          id: 'duplicate-entry-numbers',
          name: 'Duplicate Entry Numbers',
          severity: 'ERROR',
          description: `${rows.length} entry number${rows.length === 1 ? '' : 's'} appear more than once`,
          count: rows.length,
          affectedItems: rows.slice(0, 10).map((r: any) => ({ id: r.entryNumber, label: `Entry #${r.entryNumber} (${r.cnt} occurrences)` })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'duplicate-entry-numbers',
        name: 'Duplicate Entry Numbers',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    // Check 8: Future-Dated Journal Entries
    try {
      const entries = await this.prisma.journalEntry.findMany({
        where: {
          companyId,
          date: { gt: new Date() },
          postingStatus: 'POSTED',
          deletedAt: null,
        },
        select: { id: true, entryNumber: true, description: true, date: true },
        take: 10,
        orderBy: { date: 'desc' },
      })
      if (entries.length === 0) {
        checks.push({
          id: 'future-dated-entries',
          name: 'Future-Dated Journal Entries',
          severity: 'PASS',
          description: 'No posted entries with future dates',
        })
      } else {
        checks.push({
          id: 'future-dated-entries',
          name: 'Future-Dated Journal Entries',
          severity: 'WARNING',
          description: `${entries.length} posted entr${entries.length === 1 ? 'y' : 'ies'} have dates in the future`,
          count: entries.length,
          affectedItems: entries.map(e => ({ id: e.id, label: `${e.entryNumber || e.description || e.id} (${e.date.toISOString().slice(0, 10)})` })),
        })
      }
    } catch (err: any) {
      checks.push({
        id: 'future-dated-entries',
        name: 'Future-Dated Journal Entries',
        severity: 'ERROR',
        description: `Check failed: ${err.message}`,
      })
    }

    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.severity === 'PASS').length,
      warnings: checks.filter(c => c.severity === 'WARNING').length,
      errors: checks.filter(c => c.severity === 'ERROR').length,
    }

    return { checkedAt: new Date().toISOString(), summary, checks }
  }
}
