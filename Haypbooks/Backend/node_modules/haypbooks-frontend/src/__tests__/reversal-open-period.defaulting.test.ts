import { db, seedIfNeeded, closePeriod, reopenPeriodWithAudit, createInvoice, updateInvoice, voidInvoice, createBill, voidBill } from '@/mock/db'

describe('Reversals default to open period and cross closed boundaries safely', () => {
	beforeEach(() => {
		;(db as any).seeded = false
		db.accounts.length = 0
		db.transactions.length = 0
		db.invoices.length = 0
		if (db.estimates) db.estimates.length = 0
		db.bills.length = 0
		db.customers.length = 0
		db.vendors.length = 0
		db.items.length = 0
		if (db.journalEntries) db.journalEntries.length = 0
		if (db.auditEvents) db.auditEvents.length = 0
		seedIfNeeded()
	})

	test('void invoice with reversing posts reversal in next open date when closed', () => {
		const inv = createInvoice({ number: 'INV-REV-1', customerId: db.customers[0].id, date: '2025-01-15', lines: [{ description: 'Svc', amount: 100 }] })
		updateInvoice(inv.id, { status: 'sent' })
		// Close through 2025-02-15
		closePeriod('2025-02-15')
		const voided = voidInvoice(inv.id, { createReversing: true, reason: 'Err', reversalDate: '2025-02-10' /* in closed period */ })
		expect(voided.status).toBe('void')
		// Last journal in db should be reversing with date 2025-02-16 (day after close)
		const last = (db.journalEntries || [])[ (db.journalEntries || []).length - 1]
		expect(last?.reversing).toBe(true)
		expect(last?.date.slice(0,10) >= '2025-02-16').toBe(true)
		reopenPeriodWithAudit()
	})

	test('void bill with reversing posts reversal in next open date when closed', () => {
		const bill = createBill({ vendorId: db.vendors[0].id, billDate: '2025-03-01', terms: 'Net 0', lines: [{ description: 'Svc', amount: 80 }] })
		// Close through 2025-03-10
		closePeriod('2025-03-10')
		const vb = voidBill(bill.id, { createReversing: true, reason: 'Err', reversalDate: '2025-03-05' /* in closed */ })
		expect(vb.status).toBe('void')
		const last = (db.journalEntries || [])[ (db.journalEntries || []).length - 1]
		expect(last?.reversing).toBe(true)
		expect(last?.date.slice(0,10) >= '2025-03-11').toBe(true)
		reopenPeriodWithAudit()
	})
})
