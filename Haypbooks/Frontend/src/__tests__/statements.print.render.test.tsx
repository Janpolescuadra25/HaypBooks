import React from 'react'
import { render, screen } from '@testing-library/react'

/**
 * Customer Statement print page render test
 * - Mocks fetch for statement and customer endpoints
 * - Mocks getBaseUrl and next/link
 * - Mocks Amount to stable $ formatting
 */
describe('Customer Statement print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/customers/') && url.includes('/statement')) {
        const lines = [
          { id: 'inv1', type: 'invoice', date: '2025-09-01', description: 'INV-001', amount: 200, runningBalance: 200 },
          { id: 'pay1', type: 'payment', date: '2025-09-05', description: 'PAY-1', amount: -50, runningBalance: 150 }
        ]
        return Promise.resolve(new Response(JSON.stringify({ statement: { customerId: 'c1', asOf: '2025-09-15', lines, totals: { invoices: 200, payments: -50, credits: 0, net: 150 } } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.endsWith('/api/customers/c1')) {
        return Promise.resolve(new Response(JSON.stringify({ customer: { id: 'c1', name: 'Acme Co' } }), { status: 200 }))
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

  test('renders caption As of and totals row', async () => {
    const Page = (await import('@/app/sales/statements/[id]/print/page')).default as any
    const el = await Page({ params: { id: 'c1' }, searchParams: { asOf: '2025-09-15' } })
    render(el)
    expect(screen.getByText(/Statement - Acme Co/)).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText(/Totals/)).toBeInTheDocument()
  })
})
