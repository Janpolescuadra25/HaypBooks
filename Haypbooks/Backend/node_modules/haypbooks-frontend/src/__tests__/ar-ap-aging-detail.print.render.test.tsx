import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Aging Detail Print pages', () => {
  const origFetch = global.fetch
  const mockRowsAR = [{ customer: 'Acme Co', type: 'Invoice', number: 'INV-1', invoiceDate: '2025-09-01', dueDate: '2025-09-10', aging: 5, openBalance: 100 }]
  const mockRowsAP = [{ vendor: 'Vendor A', type: 'Bill', number: 'BILL-1', billDate: '2025-09-01', dueDate: '2025-09-10', aging: 5, openBalance: 75 }]

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/ar-aging-detail')) {
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'YTD', rows: mockRowsAR, totals: { openBalance: 100 } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/reports/ap-aging-detail')) {
        return Promise.resolve(new Response(JSON.stringify({ asOf: '2025-09-15', period: 'YTD', rows: mockRowsAP, totals: { openBalance: 75 } }), { status: 200 }))
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

  test('A/R Aging Detail print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/ar-aging-detail/print/page')).default as any
    const el = await Page({ searchParams: { start: '2025-09-01', end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('A/R Aging Detail')).toBeInTheDocument()
    expect(screen.getByText(/09\/01\/2025/)).toBeInTheDocument() // formatted date range present
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })

  test('A/P Aging Detail print renders caption and totals', async () => {
    const Page = (await import('@/app/reports/ap-aging-detail/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('A/P Aging Detail')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })
})
