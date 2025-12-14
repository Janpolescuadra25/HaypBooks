import React from 'react'
import { render, screen } from '@testing-library/react'

// NOTE: Dedicated print routes were deprecated and now notFound().
// This legacy test is skipped to keep the suite aligned with current policy.
describe.skip('Transaction List by Date print page (deprecated)', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/transaction-list-by-date')) {
        const json = {
          asOf: '2025-09-15',
          rows: [
            { date: '2025-09-14', type: 'Invoice', number: 'INV-1001', name: 'Customer A', memo: 'Consulting', debit: 1000, credit: 0 },
            { date: '2025-09-15', type: 'Receipt', number: 'RC-2001', name: 'Customer A', memo: 'Payment', debit: 0, credit: 500 },
          ],
          totals: { debit: 1000, credit: 500 },
          start: null,
          end: null,
        }
        return Promise.resolve(new Response(JSON.stringify(json), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders caption and totals', async () => {
    const Page = (await import('@/app/reports/transaction-list-by-date/print/page')).default as any
    const el = await Page({ searchParams: {} })
    render(el)
    expect(screen.getByText('Transaction List by Date')).toBeInTheDocument()
  expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
