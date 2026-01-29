import { PrismaClient } from '@prisma/client'
import { postPendingRevenueRecognition } from '../jobs/revenue-recognition.job'

const prisma = new PrismaClient()

beforeAll(async () => {})
afterAll(async () => { await prisma.$disconnect() })

test('posts pending revenue recognition phase', async () => {
  // setup workspace and company
  const user = await prisma.user.create({ data: { email: `owner-${Date.now()}@example.com`, password: 'x' } } as any)
  const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id, type: 'OWNER', status: 'ACTIVE' } } as any)
  let country = await prisma.country.findUnique({ where: { code: 'PH' } })
  if (!country) country = await prisma.country.create({ data: { code: 'PH', name: 'Philippines' } })
  const company = await prisma.company.create({
    data: {
      name: 'Test Co',
      workspace: { connect: { id: workspace.id } },
      countryConfig: { connect: { id: country.id } }
    }
  } as any)


  // account types
  const acctTypeRevenue = await prisma.accountType.create({ data: { name: 'Revenue', category: 'REVENUE' } })
  const acctTypeLiability = await prisma.accountType.create({ data: { name: 'Liability', category: 'LIABILITY' } })

  // accounts
  const revAccount = await prisma.account.create({ data: { companyId: company.id, code: '4000', name: 'Sales Revenue', typeId: acctTypeRevenue.id } })
  const defAccount = await prisma.account.create({ data: { companyId: company.id, code: '2100', name: 'Unearned Revenue', typeId: acctTypeLiability.id } })

  // invoice + line
  const contact = await prisma.contact.create({ data: { displayName: `Customer ${Date.now()}`, type: 'CUSTOMER', workspace: { connect: { id: workspace.id } } } } as any)
  const customer = await prisma.customer.create({ data: { contactId: contact.id, workspaceId: workspace.id } } as any)
  const invoiceId = `inv-${Date.now()}`
  const invoice = await prisma.invoice.create({ data: { id: invoiceId, invoiceNumber: 'INV-1', status: 'SENT', dueDate: new Date(), totalAmount: '1000', balance: '1000', company: { connect: { id: company.id } }, workspace: { connect: { id: workspace.id } }, customer: { connect: { contactId: contact.id } } } } as any)
  const line = await prisma.invoiceLine.create({ data: { description: 'Svc', quantity: 1, unitPrice: '1000', totalPrice: '1000', company: { connect: { id: company.id } }, invoice: { connect: { id: invoice.id } }, workspace: { connect: { id: workspace.id } } } } as any)

  // schedule + phase
  const schedule = await prisma.revenueRecognitionSchedule.create({ data: { workspaceId: workspace.id, invoiceLineId: line.id, totalAmount: '1000', recognizedToDate: '0', schedule: JSON.stringify([{ phaseNumber: 1, percentage: 1, amount: '1000', recognitionDate: new Date() }]) } } as any)
  const phase = await prisma.revenueRecognitionPhase.create({ data: { workspaceId: workspace.id, scheduleId: schedule.id, phaseNumber: 1, percentage: '1', amount: '1000', recognitionDate: new Date(), status: 'PENDING' } } as any)

  const processed = await postPendingRevenueRecognition(10)
  expect(processed).toBeGreaterThanOrEqual(1)

  const updatedPhase = await prisma.revenueRecognitionPhase.findUnique({ where: { id: phase.id } })
  expect(updatedPhase?.status).toBe('POSTED')
  expect(updatedPhase?.journalEntryId).toBeDefined()

  const updatedSchedule = await prisma.revenueRecognitionSchedule.findUnique({ where: { id: schedule.id } })
  expect(Number(updatedSchedule?.recognizedToDate)).toBeGreaterThanOrEqual(1000)

  expect(updatedPhase?.journalEntryId).toBeDefined()
  const journalLines: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM public."JournalEntryLine" WHERE "journalId" = '${updatedPhase!.journalEntryId!}'`)
  expect(journalLines.length).toBe(2)
  const debit = journalLines.find((l) => Number(l.debit) > 0)
  const credit = journalLines.find((l) => Number(l.credit) > 0)
  expect(debit).toBeDefined()
  expect(credit).toBeDefined()
})
