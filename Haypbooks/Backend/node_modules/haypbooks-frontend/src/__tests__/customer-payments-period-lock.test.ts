import { seedIfNeeded, db, closePeriod, reopenPeriodWithAudit, createInvoice, updateInvoice, createCustomerPayment, createDeposit } from '@/mock/db'
import { mockApi } from '@/lib/mock-api'

describe('Payments and Deposits respect closed periods', () => {
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
		if ((db as any).creditMemos) (db as any).creditMemos.length = 0
		if (db.deposits) db.deposits.length = 0
			// Ensure periods are open before seeding
			if (db.settings) (db.settings as any).closeDate = null
		seedIfNeeded()
	})

	test('createCustomerPayment blocks when current date is in closed period', () => {
		const cust = db.customers[0]
		const inv = createInvoice({ number: 'INV-PERIOD-CP', customerId: cust.id, date: '2025-03-01', lines: [{ description: 'Svc', amount: 50 }] })
		updateInvoice(inv.id, { status: 'sent' })
		// Close through today to force guard on payment creation
		const todayIso = new Date().toISOString().slice(0,10)
		closePeriod(todayIso)
		expect(() => createCustomerPayment({ customerId: cust.id, amountReceived: 50, allocations: [{ invoiceId: inv.id, amount: 50 }] })).toThrow(/closed period/i)
		reopenPeriodWithAudit()
		const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 50, allocations: [{ invoiceId: inv.id, amount: 50 }] })
		expect(cp.amountAllocated).toBe(50)
	})

		test('POST /api/invoices/:id/payments returns error for closed period and success otherwise', async () => {
		const cust = db.customers[1]
		const inv = createInvoice({ number: 'INV-PERIOD-API', customerId: cust.id, date: '2025-03-02', lines: [{ description: 'Svc', amount: 60 }] })
		updateInvoice(inv.id, { status: 'sent' })
		const todayIso = new Date().toISOString().slice(0,10)
			closePeriod(todayIso)
			// mockApi throws Errors for failure cases; verify error message
			await expect(mockApi<any>(`/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 10 }) }))
				.rejects.toThrow(/closed period/i)
		reopenPeriodWithAudit()
		const resOk = await mockApi<any>(`/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 10 }) })
		expect(resOk.payment.amount).toBe(10)
	})

	test('createDeposit blocks in closed period; succeeds after reopen', () => {
		const cust = db.customers[2]
		const inv = createInvoice({ number: 'INV-PERIOD-DEP', customerId: cust.id, date: '2025-03-03', lines: [{ description: 'Svc', amount: 70 }] })
		updateInvoice(inv.id, { status: 'sent' })
		const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 70, allocations: [{ invoiceId: inv.id, amount: 70 }] })
		// Close through today to block deposit
		const todayIso = new Date().toISOString().slice(0,10)
		closePeriod(todayIso)
		expect(() => createDeposit({ paymentIds: cp.paymentIds })).toThrow(/closed period/i)
		reopenPeriodWithAudit()
		const dep = createDeposit({ paymentIds: cp.paymentIds })
		expect(dep.total).toBe(70)
	})
})

