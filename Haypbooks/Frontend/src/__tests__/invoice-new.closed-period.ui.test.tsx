import { render, screen, waitFor } from '@testing-library/react'
import NewInvoicePage from '@/app/invoices/new/page'

const today = new Date().toISOString().slice(0,10)

describe('Invoice New - closed period UI', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    // Route-aware fetch mock
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/api/user/profile')) {
        return Promise.resolve({ ok: true, json: async () => ({ permissions: ['invoices:write'] }) } as any)
      }
      if (url.endsWith('/api/periods')) {
        return Promise.resolve({ ok: true, json: async () => ({ closedThrough: today }) } as any)
      }
      if (url.endsWith('/api/customers')) {
        return Promise.resolve({ ok: true, json: async () => ({ customers: [{ id: 'c_1', name: 'Acme' }] }) } as any)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any)
    })
    // @ts-ignore
    global.fetch = fetchMock
  })

  test('disables submit and shows inline message when date is blocked', async () => {
    render(<NewInvoicePage />)
    // Wait for banner/inline status to appear
    await waitFor(() => expect(screen.getByText(/Dates on or before the closed-through date are blocked|Selected date is within a closed period/i)).toBeInTheDocument())
    // Button disabled — allow either the legacy 'Create Invoice' label or the current 'Save & Send'
    const btn = await screen.findByRole('button', { name: /Create Invoice|Save & Send/i })
    expect(btn).toBeDisabled()
  })
})
