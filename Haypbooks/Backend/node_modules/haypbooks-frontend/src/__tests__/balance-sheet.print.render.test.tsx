import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Balance Sheet print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/balance-sheet')) {
        const json = {
          period: 'YTD',
          asOf: '2025-09-15',
          assets: [{ name: 'Cash', amount: 1200 }],
          liabilities: [{ name: 'Accounts Payable', amount: -300 }],
          equity: [{ name: 'Owner’s Equity', amount: 900 }],
          totals: { assets: 1200, liabilities: -300, equity: 900 },
          balanced: true,
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
    const Page = (await import('@/app/reports/balance-sheet/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Balance Sheet')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Total Assets')).toBeInTheDocument()
    expect(screen.getByText('Total Liabilities')).toBeInTheDocument()
    expect(screen.getByText('Total Equity')).toBeInTheDocument()
  })
})
