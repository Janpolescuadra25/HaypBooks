import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from '@/app/accountant/finance-charges/page'

jest.mock('next/navigation', () => ({ usePathname: () => '/accountant/finance-charges' }))

describe('Finance charges UI confirm before apply', () => {
  const originalFetch = global.fetch as any
  const originalConfirm = (global as any).confirm
  afterEach(() => {
    global.fetch = originalFetch
    // @ts-ignore
    global.confirm = originalConfirm
  })

  it('prompts confirm before applying charges', async () => {
    // Stub preview and apply
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/accountant/finance-charges/preview') && method === 'GET') {
        return { ok: true, json: async () => ({ rows: [
          { id: 'inv1', number: 'INV-1', customer: 'Acme', dueDate: '2025-09-01', daysPastDue: 10, assessDays: 10, balance: 100, suggestedCharge: 5 },
          { id: 'inv2', number: 'INV-2', customer: 'Acme', dueDate: '2025-09-05', daysPastDue: 6, assessDays: 6, balance: 200, suggestedCharge: 3 },
        ] }) } as any
      }
      if (url.startsWith('/api/accountant/finance-charges/apply') && method === 'POST') {
        return { ok: true, json: async () => ({ ok: 2, failed: 0, results: [] }) } as any
      }
      if (url.startsWith('/api/accounts') && method === 'GET') {
        return { ok: true, json: async () => ({ accounts: [ { id: 'a1', number: '4100', name: 'Income' } ] }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)

    const user = userEvent.setup()
    render(<Page />)

    // wait for preview table to load (happens on mount) — wait for a preview row
    await screen.findByText('INV-1')

    // First click should call confirm
    // @ts-ignore
    global.confirm = jest.fn(() => false)

    const applyBtn = screen.getByRole('button', { name: /apply/i })
    await act(async () => {
      await user.click(applyBtn)
    })
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled()
    })

    // Accept and ensure apply is executed
    ;(global.confirm as any) = jest.fn(() => true)
    const fetchSpy = global.fetch as any
    await act(async () => {
      await user.click(applyBtn)
    })
    // Ensure the apply POST was made
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/accountant/finance-charges/apply'), expect.objectContaining({ method: 'POST' }))
    // Wait for the result to appear after apply completes
    await screen.findByText(/Applied: 2/i)
  })
})
