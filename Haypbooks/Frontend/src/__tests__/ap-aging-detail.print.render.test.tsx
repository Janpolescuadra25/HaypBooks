import React from 'react'
import { render, screen } from '@testing-library/react'

describe('A/P Aging Detail print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/ap-aging-detail')) {
        const rows = [
          { vendor: 'Vendor A', type: 'Bill', number: 'B-1', billDate: '2025-09-01', dueDate: '2025-09-15', aging: 3, openBalance: 120 },
        ]
        const json = { asOf: '2025-09-15', period: 'MTD', rows, totals: { openBalance: 120 } }
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
    const Page = (await import('@/app/reports/ap-aging-detail/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('A/P Aging Detail')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })
})
