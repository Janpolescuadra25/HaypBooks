import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntry(companyId: string | null, payload: { date: string; description?: string; lines: any[]; tenantId?: string }) {
    // minimal; ensure balancing validation before persisting
    const totalDebit = payload.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0)
    const totalCredit = payload.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.000001) throw new Error('Journal entry not balanced')

    const tenantId = (payload as any).tenantId || companyId
    // Only validate company when a companyId is explicitly provided
    if (companyId) await assertCompanyBelongsToTenant(this.prisma as any, companyId, tenantId)
    const entry = await this.prisma.journalEntry.create({ data: { tenantId, companyId, date: new Date(payload.date), description: payload.description } })
    for (const l of payload.lines) {
      await this.prisma.journalEntryLine.create({ data: { journalId: entry.id, companyId, accountId: l.accountId, debit: l.debitAmount || 0, credit: l.creditAmount || 0, tenantId: tenantId } })
    }
    return entry
  }
}
