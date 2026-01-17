import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync } from '@/test-utils/act-helpers'

// Mock minimal navigation (Receipts page does not heavily rely on router mutations for this test)
jest.mock('next/navigation', () => ({
  usePathname: () => '/transactions/receipts',
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
}))

// RBAC: force admin role for lifecycle actions
jest.mock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))

import ReceiptsPage from '@/app/transactions/receipts/page'
import { upsertInvoice } from '@/app/api/invoices/store'
import { upsertBill } from '@/app/api/bills/store'

describe('Receipts Linked Match Preview UI', () => {
  const realFetch = global.fetch
  beforeEach(() => {
    upsertInvoice({ id: 'inv-prev', number: 'INV-PREV', customer: 'PreviewCo', status: 'sent', total: 33.33, date: '2025-01-03', items: [{ description: 'Service', amount: 33.33 }], payments: [] })
    upsertBill({ id: 'bill-prev', number: 'BILL-PREV', vendor: 'VendorPrev', status: 'open', total: 22.22, dueDate: '2025-02-01', items: [{ description: 'Line', amount: 22.22 }], payments: [] })
    // Intercept fetch calls to simulate backend for create/match/list/linked
    let receipts: any[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/receipts') && method === 'GET' && !/\/linked/.test(url) && !/\/match/.test(url)) {
        return { ok: true, json: async () => ({ receipts }) } as any
      }
      if (url.startsWith('/api/receipts') && method === 'POST' && !/\/match/.test(url)) {
        // create or parse (we only need create for this test; parse is auto-called but we ignore result)
        const body = JSON.parse(String(init?.body || '{}'))
        const id = `r${receipts.length + 1}`
        const rec = { id, date: body.date || '2025-01-01', vendor: body.vendor || 'V', amount: body.amount || 0, status: 'uploaded', attachment: body.attachment, method: body.method || 'upload' }
        receipts.unshift(rec)
        return { ok: true, status: 201, json: async () => ({ receipt: rec }) } as any
      }
      if (/\/match/.test(url) && method === 'POST') {
        const id = url.split('/')[3]
        const body = JSON.parse(String(init?.body || '{}'))
        receipts = receipts.map(r => r.id === id ? { ...r, matchedTransactionId: body.transactionId, status: 'matched' } : r)
        const rec = receipts.find(r => r.id === id)
        return { ok: true, json: async () => ({ receipt: rec }) } as any
      }
      if (/\/linked/.test(url) && method === 'GET') {
        const id = url.split('/')[3]
        const rec = receipts.find(r => r.id === id)
        if (!rec) return { ok: false, status: 404, text: async () => 'not found' } as any
        if (!rec.matchedTransactionId) return { ok: false, status: 409, text: async () => 'receipt not matched' } as any
        if (rec.matchedTransactionId === 'inv-prev') {
          return { ok: true, json: async () => ({ linked: { type: 'invoice', id: 'inv-prev', number: 'INV-PREV', date: '2025-01-03', vendorOrCustomer: 'PreviewCo', status: 'sent', amountOriginal: 33.33, amountOpen: 33.33, lineCount: 1, currency: 'USD' } }) } as any
        }
        if (rec.matchedTransactionId === 'bill-prev') {
          return { ok: true, json: async () => ({ linked: { type: 'bill', id: 'bill-prev', number: 'BILL-PREV', date: '2025-02-01', dueDate: '2025-02-01', vendorOrCustomer: 'VendorPrev', status: 'open', amountOriginal: 22.22, amountOpen: 22.22, lineCount: 1, currency: 'USD' } }) } as any
        }
        return { ok: false, status: 404, text: async () => 'linked transaction not found' } as any
      }
      // parse endpoint (ignore; just respond ok)
      if (/\/parse/.test(url) && method === 'POST') {
        return { ok: true, json: async () => ({ receipt: receipts[0] }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any
  })
  afterEach(() => { global.fetch = realFetch as any })

  it('renders invoice linked preview after match', async () => {
    const user = userEvent.setup()
    render(<ReceiptsPage />)
    // Upload one receipt (auto parse will fire but stubbed)
    const file = new File(['x'], 'PreviewCo.jpg', { type: 'image/jpeg' })
    const upload = screen.getByLabelText(/Upload receipt/i)
    await withinAct(async () => { await user.upload(upload, file) })
    await flushAsync()
    // Match manually via Match button prompt interception: override window.prompt
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('inv-prev')
    await withinAct(async () => { const btns = await screen.findAllByRole('button', { name: /Match$/i }); await user.click(btns[0]) })
    promptSpy.mockRestore()
    // Open linked preview
    await withinAct(async () => { await user.click(screen.getByRole('button', { name: /View match/i })) })
    await waitFor(() => { expect(screen.getByText(/Matched Document/i)).toBeInTheDocument() })
    const modalRoot = screen.getByText(/Matched Document/i).parentElement!.parentElement!
    const m = within(modalRoot)
    expect(m.getByText(/invoice/i)).toBeInTheDocument()
    expect(m.getByText(/INV-PREV/)).toBeInTheDocument()
    expect(m.getByText(/PreviewCo/)).toBeInTheDocument()
    expect(m.getByText(/Original:/)).toBeInTheDocument()
  })

  it('renders bill linked preview after match', async () => {
    const user = userEvent.setup()
    render(<ReceiptsPage />)
    // Upload receipt for bill
    const file = new File(['x'], 'VendorPrev.jpg', { type: 'image/jpeg' })
    const upload = screen.getByLabelText(/Upload receipt/i)
    await withinAct(async () => { await user.upload(upload, file) })
    await flushAsync()
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('bill-prev')
    await withinAct(async () => { const btns = await screen.findAllByRole('button', { name: /Match$/i }); await user.click(btns[0]) })
    promptSpy.mockRestore()
    await withinAct(async () => { await user.click(screen.getByRole('button', { name: /View match/i })) })
    await waitFor(() => { expect(screen.getByText(/Matched Document/i)).toBeInTheDocument() })
    const modalRoot = screen.getByText(/Matched Document/i).parentElement!.parentElement!
    const m = within(modalRoot)
    // The modal shows the bill identifier, party, and original amount
    expect(m.getByText(/BILL-PREV/)).toBeInTheDocument()
    expect(m.getByText(/VendorPrev/)).toBeInTheDocument()
    expect(m.getByText(/Original:/)).toBeInTheDocument()
  })
})
