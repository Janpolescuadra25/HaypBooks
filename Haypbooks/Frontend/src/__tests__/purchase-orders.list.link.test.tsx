/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PurchaseOrdersPage from '@/app/(expenses)/purchase-orders/page'

// Mock next/navigation to avoid app router invariant
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/purchase-orders',
}))

// Mock server utilities
jest.mock('@/lib/rbac-server', () => ({
  getRoleFromCookies: () => 'admin',
  hasPermission: () => true,
}))

// Mock fetch for list data
const originalFetch = global.fetch
beforeEach(() => {
  const handler = (input: any) => {
    const url = String(input)
    if (url.endsWith('/api/purchase-orders')) {
      return Promise.resolve(new Response(JSON.stringify({ purchaseOrders: [] }), { status: 200 }))
    }
    return typeof originalFetch === 'function' ? originalFetch(input) : Promise.resolve(new Response('Not Found', { status: 404 }))
  }
  Object.defineProperty(global, 'fetch', { value: handler, configurable: true, writable: true })
})

afterEach(() => {
  Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true })
})

describe('Purchase Orders list', () => {
  test('shows New PO link to /purchase-orders/new when permitted', async () => {
    render(await PurchaseOrdersPage())
    const link = await screen.findByRole('link', { name: /new po/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/purchase-orders/new')
  })
})
