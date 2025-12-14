import React from 'react'
import { render, screen } from '@testing-library/react'

describe('General Ledger List print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/general-ledger-list')) {
        const json = {
          asOf: '2025-09-15',
          rows: [
            { account: { number: '1000', name: 'Cash' }, beginning: 1000, debits: 300, credits: 100, netChange: 200, ending: 1200 },
            { account: { number: '2000', name: 'AP' }, beginning: 500, debits: 50, credits: 50, netChange: 0, ending: 500 },
          ],
          totals: { beginning: 1500, debits: 350, credits: 150, netChange: 200, ending: 1700 },
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
    const Page = (await import('@/app/reports/general-ledger-list/print/page')).default as any
    const el = await Page({ searchParams: {} })
    render(el)
    expect(screen.getByText('General Ledger List')).toBeInTheDocument()
  expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
