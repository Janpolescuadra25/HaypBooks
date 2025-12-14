import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Customer detail page — Broken promise badge', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.doMock('next/navigation', () => ({
      useSearchParams: () => new URLSearchParams(''),
      useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), back: jest.fn() }),
    }))
    jest.doMock('next/dynamic', () => {
      const React = require('react')
      return (loader: any) => {
        const src = typeof loader === 'function' ? String(loader) : ''
        if (src.includes("@/components/Amount")) {
          const Amt = ({ value }: any) => <span>${Number(value).toFixed(2)}</span>
          ;(Amt as any).displayName = 'MockAmountDynamic'
          return Amt
        }
        return () => null
      }
    })
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.endsWith('/api/customers/c2')) {
        return Promise.resolve(new Response(JSON.stringify({ customer: { id: 'c2', name: 'Badge Co', email: '', phone: '' } }), { status: 200 }))
      }
      if (typeof url === 'string' && url.includes('/api/customers/c2/ar-snapshot')) {
        return Promise.resolve(new Response(JSON.stringify({ snapshot: { customerId: 'c2', asOf: '2025-10-01', openInvoices: 1, openBalance: 100, unappliedCredits: 0, netReceivable: 100, overdueBalance: 0, daysSinceLastPayment: 5, openPromises: 1, nextPromiseDate: '2025-09-01', promiseAgingDays: 10, riskLevel: 'moderate' } }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('@/lib/rbac', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))
    jest.doMock('@/components/AuditEventsPanel', () => ({ __esModule: true, default: () => null }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('shows Broken promise badge when promiseAgingDays > 0', async () => {
    const Page = (await import('@/app/customers/[id]/page')).default as any
    const el = await Page({ params: { id: 'c2' } })
    render(el)

    expect(screen.getByText('Badge Co')).toBeInTheDocument()
    expect(screen.getByText('Broken promise')).toBeInTheDocument()
  })
})
