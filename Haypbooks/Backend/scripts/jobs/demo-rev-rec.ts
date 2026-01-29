import { PrismaClient } from '@prisma/client'
import { postPendingRevenueRecognition } from '../../src/jobs/revenue-recognition.job'

const prisma = new PrismaClient()

async function run() {
  const user = await prisma.user.upsert({ where: { email: 'owner@example.com' }, update: {}, create: { email: 'owner@example.com', password: 'x' } })
  const workspace = await prisma.workspace.upsert({ where: { ownerUserId: user.id }, update: {}, create: { ownerUserId: user.id, type: 'OWNER', status: 'ACTIVE' } })
  // create a company (countryId required)
  let company = await prisma.company.findFirst({ where: { name: 'Demo Co', workspaceId: workspace.id } })
  if (!company) {
    company = await prisma.company.create({ data: { name: 'Demo Co', workspaceId: workspace.id, countryId: 'PH' } as any })
  }

  // find or create account types
  let acctTypeRev = await prisma.accountType.findFirst({ where: { name: 'DemoRevenue' } })
  if (!acctTypeRev) acctTypeRev = await prisma.accountType.create({ data: { name: 'DemoRevenue', category: 'REVENUE' } })
  let acctTypeLiab = await prisma.accountType.findFirst({ where: { name: 'DemoLiability' } })
  if (!acctTypeLiab) acctTypeLiab = await prisma.accountType.create({ data: { name: 'DemoLiability', category: 'LIABILITY' } })

  // find or create accounts
  let revAcc = await prisma.account.findFirst({ where: { companyId: company.id, name: 'Sales Revenue' } })
  if (!revAcc) revAcc = await prisma.account.create({ data: { companyId: company.id, code: '4000', name: 'Sales Revenue', typeId: acctTypeRev.id } as any })
  let liabAcc = await prisma.account.findFirst({ where: { companyId: company.id, name: 'Unearned Revenue' } })
  if (!liabAcc) liabAcc = await prisma.account.create({ data: { companyId: company.id, code: '2100', name: 'Unearned Revenue', typeId: acctTypeLiab.id } as any })

  const invoice = await prisma.invoice.create({ data: { companyId: company.id, workspaceId: workspace.id, invoiceNumber: 'DEMO-1', status: 'SENT', dueDate: new Date() } } as any)
  const line = await prisma.invoiceLine.create({ data: { companyId: company.id, invoiceId: invoice.id, workspaceId: workspace.id, description: 'Demo svc', quantity: 1, rate: '2000', amount: '2000' } } as any)

  const schedule = await prisma.revenueRecognitionSchedule.create({ data: { workspaceId: workspace.id, invoiceLineId: line.id, totalAmount: '2000', recognizedToDate: '0', schedule: JSON.stringify([{ phaseNumber: 1, percentage: 1, amount: '2000', recognitionDate: new Date(Date.now() - 60000) }]) } } as any)
  const phase = await prisma.revenueRecognitionPhase.create({ data: { workspaceId: workspace.id, scheduleId: schedule.id, phaseNumber: 1, percentage: '1', amount: '2000', recognitionDate: new Date(Date.now() - 60000), status: 'PENDING' } } as any)

  console.log('Created demo phase', phase.id)

  const n = await postPendingRevenueRecognition(50)
  console.log('Processed phases:', n)

  const updatedPhase = await prisma.revenueRecognitionPhase.findUnique({ where: { id: phase.id } })
  console.log('Updated phase status:', updatedPhase?.status, 'journalEntryId:', updatedPhase?.journalEntryId)

  if (updatedPhase?.journalEntryId) {
    const lines = await prisma.journalEntryLine.findMany({ where: { journalId: updatedPhase.journalEntryId } })
    console.log('Journal lines:', lines)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect(); process.exit(0) })
