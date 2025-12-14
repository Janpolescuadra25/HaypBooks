import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Profit & Loss print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/profit-loss')) {
        const u = new URL(url)
        const compare = u.searchParams.get('compare') === '1'
        const json: any = {
          period: 'MTD',
          lines: [
            { name: 'Revenue', amount: 1000 },
            { name: 'Operating Expenses', amount: -400 },
          ],
          totals: { netIncome: 600 },
        }
        if (compare) {
          json.prevLines = [
            { name: 'Revenue', amount: 800 },
            { name: 'Operating Expenses', amount: -350 },
          ]
          json.prevTotals = { netIncome: 450 }
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

  test('renders caption and Net Income total', async () => {
    const Page = (await import('@/app/reports/profit-loss/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Profit & Loss')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Net Income')).toBeInTheDocument()
  })

  test('renders compare columns when compare=1', async () => {
    const Page = (await import('@/app/reports/profit-loss/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15', compare: '1' } })
    render(el)
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})
