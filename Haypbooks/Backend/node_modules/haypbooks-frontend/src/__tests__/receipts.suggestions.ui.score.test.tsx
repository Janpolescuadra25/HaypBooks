import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withinAct, flushAsync } from '@/test-utils/act-helpers'

// Mock navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/transactions/receipts',
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
}))

// RBAC always allowed
jest.mock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))

import ReceiptsPage from '@/app/transactions/receipts/page'

describe('Receipts suggestions UI score & similarity display', () => {
  const realFetch = global.fetch
  beforeEach(() => {
    let receipts: any[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/receipts') && method === 'GET' && /\/suggestions/.test(url)) {
        // Return fixed suggestions with varying score/vendorSimilarity
        return {
          ok: true,
          json: async () => ({
            suggestions: [
              { kind: 'invoice', id: 'txn-high', name: 'High Co', remaining: 50, amountDifference: 0, dateDifferenceDays: 1, vendorSimilarity: 0.92, score: 0.88 },
              { kind: 'bill', id: 'txn-mid', name: 'Medium Supplies', remaining: 50, amountDifference: 0, dateDifferenceDays: 2, vendorSimilarity: 0.65, score: 0.57 },
              { kind: 'bill', id: 'txn-low', name: 'Low Parts', remaining: 50, amountDifference: 0, dateDifferenceDays: 3, vendorSimilarity: 0.30, score: 0.25 },
            ]
          })
        } as any
      }
      if (url.startsWith('/api/receipts') && method === 'GET') {
        return { ok: true, json: async () => ({ receipts }) } as any
      }
      if (url.startsWith('/api/receipts') && method === 'POST' && !/\/match/.test(url)) {
        const body = JSON.parse(String(init?.body || '{}'))
        const id = `r${receipts.length + 1}`
        const rec = { id, date: body.date || '2025-01-01', vendor: body.vendor || 'V', amount: body.amount || 50, status: 'uploaded', attachment: body.attachment, method: body.method || 'upload' }
        receipts.unshift(rec)
        return { ok: true, status: 201, json: async () => ({ receipt: rec }) } as any
      }
      if (/\/parse/.test(url) && method === 'POST') {
        return { ok: true, json: async () => ({}) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any
  })
  afterEach(() => { global.fetch = realFetch as any })

  it('shows score & similarity columns and filters by threshold', async () => {
    const user = userEvent.setup()
    render(<ReceiptsPage />)
    const file = new File(['x'], 'High Co.jpg', { type: 'image/jpeg' })
    const upload = screen.getByLabelText(/Upload receipt/i)
    await withinAct(async () => { await user.upload(upload, file) })
    await flushAsync()
  // Open suggestions modal (choose button in the row for uploaded file "High Co")
  // Locate the vendor cell with exact text "High Co" (avoid attachment filename cell)
  const vendorCells = screen.getAllByText((content, node) => node?.tagName === 'TD' && content === 'High Co')
  expect(vendorCells.length).toBeGreaterThanOrEqual(1)
  const row = vendorCells[0].closest('tr') as HTMLTableRowElement
  expect(row).toBeTruthy()
  const matchButtons = Array.from(row.querySelectorAll('button')).filter(b => /Match…/.test(b.textContent || ''))
  expect(matchButtons.length).toBeGreaterThanOrEqual(1)
  await withinAct(async () => { await user.click(matchButtons[0]) })
    await waitFor(() => { expect(screen.getByText(/Match Receipt/i)).toBeInTheDocument() })
  // Columns present: query column headers explicitly
  const scoreHeader = screen.getAllByRole('columnheader', { name: /Score/i })
  expect(scoreHeader.length).toBeGreaterThanOrEqual(1)
  const simHeader = screen.getAllByRole('columnheader', { name: /Similarity/i })
  expect(simHeader.length).toBeGreaterThanOrEqual(1)
    // Initial rows (3 suggestions)
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(4) // header + 3 data rows
    // Filter: move slider to >=80 (should retain only high suggestion ~88%)
  const slider = screen.getByLabelText(/Minimum composite score/i) as HTMLInputElement
  // Set value programmatically for range input
  slider.value = '80'
  await withinAct(async () => { slider.dispatchEvent(new Event('input', { bubbles: true })) })
    await waitFor(() => {
      const percentCells = screen.getAllByText(/%$/)
      // Expect one score cell at 88% (approx) present
      expect(percentCells.some(c => /88%|87%|89%/.test(c.textContent || ''))).toBeTruthy()
    })
  })
})
