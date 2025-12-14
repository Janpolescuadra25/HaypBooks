import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Vendor Statement Page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => new URLSearchParams(''),
      useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), back: jest.fn() }),
      usePathname: () => '/vendor-statements/ven_1',
    }))
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/vendors/') && url.includes('/statement')) {
        const lines = [
          { id: 'bill1', type: 'bill', date: '2025-09-01', description: 'Bill BILL-001', amount: 120, runningBalance: 120 },
          { id: 'pay1', type: 'payment', date: '2025-09-05', description: 'Payment applied to BILL-001', amount: -20, runningBalance: 100 },
        ]
        const aging = { totals: { current: 60, 30: 20, 60: 10, 90: 5, '120+': 5, total: 100 } as any }
        return Promise.resolve(new Response(JSON.stringify({ vendor: { id: 'ven_1', name: 'Vendor 1' }, asOf: '2025-10-01', lines, totals: { bills: 120, payments: -20, credits: 0, net: 100 }, aging }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${Number(value).toFixed(2)}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('renders title, aging headers, and totals', async () => {
    const Page = (await import('@/app/(expenses)/vendor-statements/[id]/page')).default as any
    const ui = await Page({ params: { id: 'ven_1' }, searchParams: { asOf: '2025-10-01' } as any } as any)
    render(ui as any)
    expect(screen.getByText(/Vendor Statement - Vendor 1/)).toBeInTheDocument()
    expect(screen.getByText('Aging')).toBeInTheDocument()
    expect(screen.getByText('120+')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
