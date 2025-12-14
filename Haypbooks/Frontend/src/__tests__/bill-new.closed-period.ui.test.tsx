import { render, screen, waitFor } from '@testing-library/react'
import NewBillPage from '@/app/bills/new/page'

const today = new Date().toISOString().slice(0,10)

describe('Bill New - closed period UI', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/api/user/profile')) {
        return Promise.resolve({ ok: true, json: async () => ({ permissions: ['bills:write'] }) } as any)
      }
      if (url.endsWith('/api/periods')) {
        return Promise.resolve({ ok: true, json: async () => ({ closedThrough: today }) } as any)
      }
      if (url.endsWith('/api/vendors')) {
        return Promise.resolve({ ok: true, json: async () => ({ vendors: [{ id: 'v_1', name: 'Vendor' }] }) } as any)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any)
    })
    // @ts-ignore
    global.fetch = fetchMock
  })

  test('disables submit and shows inline message when date is blocked', async () => {
    render(<NewBillPage />)
    await waitFor(() => expect(screen.getByText(/Dates on or before the closed-through date are blocked|Selected date is within a closed period/i)).toBeInTheDocument())
    const btn = await screen.findByRole('button', { name: /Save Bill/i })
    expect(btn).toBeDisabled()
  })
})
