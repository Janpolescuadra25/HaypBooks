import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntry(companyId: string | null, payload: { date: string; description?: string; lines: any[]; workspaceId?: string }) {
    // minimal; ensure balancing validation before persisting
    const totalDebit = payload.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0)
    const totalCredit = payload.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.000001) throw new Error('Journal entry not balanced')

    const workspaceId = (payload as any).workspaceId || companyId
    // Only validate company when a companyId is explicitly provided
    if (companyId) await assertCompanyBelongsToTenant(this.prisma as any, companyId, workspaceId)
    const entry = await this.prisma.journalEntry.create({ data: { workspace: { connect: { id: workspaceId } }, company: companyId ? { connect: { id: companyId } } : undefined, date: new Date(payload.date), description: payload.description } as any })
    for (const l of payload.lines) {
      await this.prisma.journalEntryLine.create({ data: { journalId: entry.id, company: companyId ? { connect: { id: companyId } } : undefined, accountId: l.accountId, debit: l.debitAmount || 0, credit: l.creditAmount || 0, workspace: { connect: { id: workspaceId } } } as any })
    }
    return entry
  }
}
