/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import PurchaseOrdersPage from '@/app/(expenses)/purchase-orders/page'
import { CurrencyProvider } from '@/components/CurrencyProvider'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/purchase-orders',
}))

jest.mock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))

const originalFetch = global.fetch
beforeEach(() => {
  const handler = (input: any) => {
    const url = String(input)
    if (url.endsWith('/api/settings')) {
      return Promise.resolve(new Response(JSON.stringify({ settings: { baseCurrency: 'USD' } }), { status: 200 }))
    }
    if (url.endsWith('/api/purchase-orders')) {
      return Promise.resolve(new Response(JSON.stringify({ purchaseOrders: [
        { id: 'open-1', number: 'PO-1', vendor: 'Vendor', status: 'open', date: '2025-09-27', total: 100 },
        { id: 'closed-1', number: 'PO-2', vendor: 'Vendor', status: 'closed', date: '2025-09-27', total: 50 },
      ] }), { status: 200 }))
    }
    return typeof originalFetch === 'function' ? originalFetch(input) : Promise.resolve(new Response('Not Found', { status: 404 }))
  }
  Object.defineProperty(global, 'fetch', { value: handler, configurable: true, writable: true })
})

afterEach(() => {
  Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true })
})

describe('Purchase Orders list receive link', () => {
  test('open PO has enabled Receive button; closed is disabled', async () => {
    render(
      <CurrencyProvider>
        {await PurchaseOrdersPage()}
      </CurrencyProvider>
    )
    const buttons = await screen.findAllByRole('button', { name: /^receive$/i })
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()
  })
})
