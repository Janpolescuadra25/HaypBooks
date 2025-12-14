import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Transaction Detail by Account print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/transaction-detail-by-account')) {
        const json = {
          asOf: '2025-09-15',
          rows: [
            { account: { number: '1000', name: 'Cash' }, date: '2025-09-14', memo: 'Txn 1', debit: 50, credit: 0 },
            { account: { number: '2000', name: 'AP' }, date: '2025-09-15', memo: 'Txn 2', debit: 0, credit: 50 },
          ],
          totals: { debit: 50, credit: 50 },
        }
        return Promise.resolve(new Response(JSON.stringify(json), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${'{'}Number(value).toFixed(2){'}'}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders caption and totals', async () => {
    const Page = (await import('@/app/reports/transaction-detail-by-account/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Transaction Detail by Account')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })
})
