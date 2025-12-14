/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReceivePOPage from '@/app/purchase-orders/[id]/receive/page'

// Mock next/navigation hooks
const push = jest.fn(); const replace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, back: jest.fn(), refresh: jest.fn() }),
  useParams: () => ({ id: 'po-1' })
}))

// Mock API client to intercept POST
const mockApi = jest.fn()
jest.mock('@/lib/api', () => ({ api: (...args: any[]) => mockApi(...args) }))

// Mock fetch for profile guard
const originalFetch = global.fetch
beforeEach(() => {
  push.mockReset(); replace.mockReset(); mockApi.mockReset()
  Object.defineProperty(global, 'fetch', { value: (input: any) => {
    const url = String(input)
    if (url.endsWith('/api/user/profile')) {
      return Promise.resolve(new Response(JSON.stringify({ permissions: ['bills:write'] }), { status: 200 }))
    }
    return typeof originalFetch === 'function' ? originalFetch(input) : Promise.resolve(new Response('Not Found', { status: 404 }))
  }, configurable: true, writable: true })
})

afterEach(() => {
  Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true })
})

describe('Receive PO page', () => {
  test('submits and navigates back to list', async () => {
    mockApi.mockResolvedValueOnce({ ok: true })
    render(<ReceivePOPage />)

    // Fill optional Bill # and Terms; Bill date prefilled
    fireEvent.change(screen.getByLabelText(/bill #/i), { target: { value: 'B-100' } })
    fireEvent.change(screen.getByLabelText(/terms/i), { target: { value: 'Net 15' } })
    fireEvent.click(screen.getByRole('button', { name: /^receive$/i }))

    await waitFor(() => expect(mockApi).toHaveBeenCalled())
    expect(mockApi.mock.calls[0][0]).toBe('/api/purchase-orders/po-1/receive')
    expect(push).toHaveBeenCalledWith('/purchase-orders')
  })

  test('redirects when lacking permission', async () => {
    // Change profile: no bills:write
    Object.defineProperty(global, 'fetch', { value: (input: any) => {
      const url = String(input)
      if (url.endsWith('/api/user/profile')) {
        return Promise.resolve(new Response(JSON.stringify({ permissions: [] }), { status: 200 }))
      }
      return typeof originalFetch === 'function' ? originalFetch(input) : Promise.resolve(new Response('Not Found', { status: 404 }))
    }, configurable: true, writable: true })

    render(<ReceivePOPage />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/purchase-orders'))
  })
})
