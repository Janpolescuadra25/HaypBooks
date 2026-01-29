import { PrismaClient } from '@prisma/client'
import { postPendingRevenueRecognition } from '../src/jobs/revenue-recognition.job'

const prisma = new PrismaClient()

beforeAll(async () => {
  // ensure clean state if needed
})

afterAll(async () => {
  await prisma.$disconnect()
})

test('posts pending revenue recognition phase', async () => {
  // create workspace/company
  const workspace = await prisma.workspace.create({ data: { id: 'ws-test', name: 'ws' } } as any)
  // create company
  const company = await prisma.company.create({ data: { id: 'comp-test', workspaceId: workspace.id, name: 'Test Co' } } as any)

  // create account types for lookup
  const acctTypeRevenue = await prisma.accountType.create({ data: { name: 'Revenue', category: 'REVENUE' } })
  const acctTypeLiability = await prisma.accountType.create({ data: { name: 'Liability', category: 'LIABILITY' } })

  // accounts
  const revAccount = await prisma.account.create({ data: { companyId: company.id, code: '4000', name: 'Sales Revenue', typeId: acctTypeRevenue.id } })
  const defAccount = await prisma.account.create({ data: { companyId: company.id, code: '2100', name: 'Unearned Revenue', typeId: acctTypeLiability.id } })

  // invoice + line
  const invoice = await prisma.invoice.create({ data: { id: 'inv-1', companyId: company.id, workspaceId: workspace.id, invoiceNumber: 'INV-1', status: 'SENT', dueDate: new Date() } } as any)
  const line = await prisma.invoiceLine.create({ data: { id: 'invline-1', companyId: company.id, invoiceId: invoice.id, workspaceId: workspace.id, description: 'Svc', quantity: 1, rate: '1000', amount: '1000' } } as any)

  // schedule
  const schedule = await prisma.revenueRecognitionSchedule.create({ data: { workspaceId: workspace.id, invoiceLineId: line.id, totalAmount: '1000', recognizedToDate: '0', schedule: JSON.stringify([{ phaseNumber: 1, percentage: 1, amount: '1000', recognitionDate: new Date() }]) } as any })

  // create phase (simulate backfill or direct creation)
  const phase = await prisma.revenueRecognitionPhase.create({ data: { workspaceId: workspace.id, scheduleId: schedule.id, phaseNumber: 1, percentage: '1', amount: '1000', recognitionDate: new Date(), status: 'PENDING' } } as any)

  const processed = await postPendingRevenueRecognition(10)
  expect(processed).toBeGreaterThanOrEqual(1)

  const updatedPhase = await prisma.revenueRecognitionPhase.findUnique({ where: { id: phase.id } })
  expect(updatedPhase?.status).toBe('POSTED')
  expect(updatedPhase?.journalEntryId).toBeDefined()

  const updatedSchedule = await prisma.revenueRecognitionSchedule.findUnique({ where: { id: schedule.id } })
  expect(Number(updatedSchedule?.recognizedToDate)).toBeGreaterThanOrEqual(1000)

  const journalLines = await prisma.journalEntryLine.findMany({ where: { journalId: updatedPhase?.journalEntryId } })
  expect(journalLines.length).toBe(2)
  const debit = journalLines.find((l) => Number(l.debit) > 0)
  const credit = journalLines.find((l) => Number(l.credit) > 0)
  expect(debit).toBeDefined()
  expect(credit).toBeDefined()
})
