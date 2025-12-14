import React from 'react'
import { render, screen, within } from '@testing-library/react'
import Page from '@/app/bank-transactions/reconciliation/page'

// Use a stable base URL for server fetches in tests
jest.mock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))

describe('Reconciliation UI: disabled toggle states', () => {
  const originalFetch = global.fetch as any

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('disables toggle for reconciled and post-period-end items with helpful titles', async () => {
    const accountId = 'acc-1'
    const asOf = '2024-06-30'
    const statementEndDate = '2024-06-30'

    // Provide three items:
    // - reconciled item within period (disabled, reconciled title)
    // - post-period-end item (disabled, after-period title)
    // - normal item within period (enabled)
    const data = {
      accountId,
      asOf,
      statementEndDate,
      statementEndingBalance: 1000,
      beginningBalance: 500,
      clearedDebits: 300,
      clearedCredits: 200,
      outstandingChecks: 50,
      outstandingDeposits: 20,
      difference: -30,
      items: [
        { id: 'i1', date: '2024-06-15', type: 'Check', amount: 100, cleared: true, reconciled: true },
        { id: 'i2', date: '2024-07-01', type: 'Deposit', amount: 150, cleared: false, reconciled: false },
        { id: 'i3', date: '2024-06-10', type: 'Check', amount: 75, cleared: false, reconciled: false },
      ],
    }

    global.fetch = (jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.startsWith('http://localhost:3000/api/reports/reconciliation/summary')) {
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      }
      if (url.startsWith('http://localhost:3000/api/accounts')) {
        return new Response(JSON.stringify({ accounts: [ { id: accountId, number: '1000', name: 'Checking', type: 'Asset' } ] }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
    }) as any)

    render(<Page searchParams={{}} />)

    // Reconciled item row
    const row1 = await screen.findByText('2024-06-15')
    const tr1 = row1.closest('tr')!
    const btn1 = within(tr1).getByRole('button', { name: /Yes/i })
    expect(btn1).toBeDisabled()
    expect(btn1).toHaveAttribute('title', expect.stringMatching(/already reconciled/i))

    // Post-period-end item row
    const row2 = screen.getByText('2024-07-01')
    const tr2 = row2.closest('tr')!
    const btn2 = within(tr2).getByRole('button', { name: /^No$/i })
    expect(btn2).toBeDisabled()
    expect(btn2).toHaveAttribute('title', expect.stringMatching(/after the statement end date/i))

    // Normal item within period
    const row3 = screen.getByText('2024-06-10')
    const tr3 = row3.closest('tr')!
    const btn3 = within(tr3).getByRole('button', { name: /^No$/i })
    expect(btn3).toBeEnabled()
    expect(btn3).not.toHaveAttribute('title')
  })
})
