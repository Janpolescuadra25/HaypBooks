import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function postPendingRevenueRecognition(limit = 50) {
  const now = new Date()
  const phases = await prisma.revenueRecognitionPhase.findMany({
    where: { status: 'PENDING', recognitionDate: { lte: now } },
    include: { schedule: { include: { invoiceLine: true } } },
    take: limit,
  })

  for (const phase of phases) {
    const invoiceLine = phase.schedule.invoiceLine
    if (!invoiceLine) {
      console.warn('[rev-rec] skipping phase %s: no invoice line found', phase.id)
      continue
    }

    const companyId = invoiceLine.companyId
    const workspaceId = phase.workspaceId
    const amount = Number(phase.amount)

    // Find liability (deferred) account
    let liability = await prisma.account.findFirst({
      where: {
        companyId,
        type: { category: 'LIABILITY' },
        name: { contains: 'defer', mode: 'insensitive' },
      },
    })
    if (!liability) {
      liability = await prisma.account.findFirst({ where: { companyId, type: { category: 'LIABILITY' } } })
    }

    // Find revenue account
    let revenue = await prisma.account.findFirst({
      where: {
        companyId,
        type: { category: 'REVENUE' },
        OR: [
          { name: { contains: 'revenue', mode: 'insensitive' } },
          { name: { contains: 'sales', mode: 'insensitive' } },
        ],
      },
    })
    if (!revenue) {
      revenue = await prisma.account.findFirst({ where: { companyId, type: { category: 'REVENUE' } } })
    }

    if (!liability || !revenue) {
      console.warn('[rev-rec] skipping phase %s — missing accounts (liability:%s revenue:%s)', phase.id, !!liability, !!revenue)
      continue
    }

    // Create a JournalEntry and lines
    const journal = await prisma.journalEntry.create({
      data: {
        workspaceId,
        companyId,
        date: phase.recognitionDate,
        description: `Revenue recognition: phase ${phase.id}`,
        postingStatus: 'POSTED',
      },
    })

    await prisma.journalEntryLine.createMany({
      data: [
        {
          journalId: journal.id,
          companyId,
          workspaceId,
          accountId: liability.id,
          debit: String(amount),
          credit: '0',
          description: `Recognize revenue phase ${phase.phaseNumber}`,
        },
        {
          journalId: journal.id,
          companyId,
          workspaceId,
          accountId: revenue.id,
          debit: '0',
          credit: String(amount),
          description: `Recognize revenue phase ${phase.phaseNumber}`,
        },
      ],
    })

    await prisma.revenueRecognitionPhase.update({ where: { id: phase.id }, data: { status: 'POSTED', journalEntryId: journal.id } })

    await prisma.revenueRecognitionSchedule.update({ where: { id: phase.scheduleId }, data: { recognizedToDate: { increment: amount } } })

    console.log('[rev-rec] posted phase %s -> journal %s (amount=%s)', phase.id, journal.id, amount)
  }

  return phases.length
}

// Small CLI callable entry
if (require.main === module) {
  postPendingRevenueRecognition()
    .then((n) => console.log('[rev-rec] done, processed', n))
    .catch((err) => {
      console.error('[rev-rec] error', err)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
