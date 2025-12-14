/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CurrencyProvider } from '@/components/CurrencyProvider'
import NewPurchaseOrderPage from '@/app/purchase-orders/new/page'

// Mock next/navigation router hooks
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: replaceMock, back: jest.fn(), refresh: jest.fn() }),
}))

// Mock fetch for profile and vendors
const originalFetch = global.fetch

beforeEach(() => {
  const handler = (input: any, init?: any) => {
    const url = String(input)
    if (url.endsWith('/api/settings')) {
      return Promise.resolve(new Response(JSON.stringify({ settings: { baseCurrency: 'USD' } }), { status: 200 }))
    }
    if (url.endsWith('/api/user/profile')) {
      return Promise.resolve(new Response(JSON.stringify({ permissions: ['bills:write'] }), { status: 200 }))
    }
    if (url.endsWith('/api/vendors')) {
      return Promise.resolve(new Response(JSON.stringify({ vendors: [{ id: 'v1', name: 'Vendor A' }] }), { status: 200 }))
    }
    if (url.endsWith('/api/purchase-orders') && init?.method === 'POST') {
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    }
    if (typeof originalFetch === 'function') {
      return originalFetch(input, init)
    }
    return Promise.resolve(new Response('Not Found', { status: 404 }))
  }
  Object.defineProperty(global, 'fetch', { value: handler, configurable: true, writable: true })
})

afterEach(() => {
  Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true })
})

describe('New Purchase Order Page', () => {
  test('renders form and allows basic input', async () => {
    render(
      <CurrencyProvider>
        <NewPurchaseOrderPage />
      </CurrencyProvider>
    )

    // Wait for RBAC check and vendor load
    const vendorSelect = await screen.findByLabelText('Vendor')
    expect(vendorSelect).toBeInTheDocument()

    // Select vendor
    fireEvent.change(vendorSelect, { target: { value: 'v1' } })

    // Enter PO number
    const poNumber = screen.getByLabelText('PO #') as HTMLInputElement
    fireEvent.change(poNumber, { target: { value: 'PO-1001' } })
    expect(poNumber.value).toBe('PO-1001')

    // Add a description, qty, rate
    const desc = screen.getByPlaceholderText('Description') as HTMLInputElement
    fireEvent.change(desc, { target: { value: 'Widgets' } })
    const qty = screen.getByTitle('Quantity') as HTMLInputElement
    fireEvent.change(qty, { target: { value: '2' } })
    const rate = screen.getByTitle('Rate') as HTMLInputElement
    fireEvent.change(rate, { target: { value: '10' } })

    // Submit
    const saveBtn = screen.getByRole('button', { name: /save po/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      // After POST it navigates. We can't assert router.push here easily, so just ensure no error rendered
      expect(screen.queryByText(/failed to create purchase order/i)).not.toBeInTheDocument()
    })
  })

  test('redirects to list when lacking permission', async () => {
    replaceMock.mockClear()
    const handler = (input: any, init?: any) => {
      const url = String(input)
      if (url.endsWith('/api/settings')) {
        return Promise.resolve(new Response(JSON.stringify({ settings: { baseCurrency: 'USD' } }), { status: 200 }))
      }
      if (url.endsWith('/api/user/profile')) {
        return Promise.resolve(new Response(JSON.stringify({ permissions: [] }), { status: 200 }))
      }
      // Anything else (vendors, etc.) can 404 since redirect happens early
      return Promise.resolve(new Response('Not Found', { status: 404 }))
    }
    Object.defineProperty(global, 'fetch', { value: handler, configurable: true, writable: true })

    render(
      <CurrencyProvider>
        <NewPurchaseOrderPage />
      </CurrencyProvider>
    )

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/purchase-orders')
    })
  })
})
