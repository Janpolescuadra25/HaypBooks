import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CloseBooksPage from '@/app/settings/close-books/page'

// Mock fetch for settings and actions
const fetchMock = jest.fn()

describe('Close Books settings page', () => {
  beforeEach(() => {
    global.fetch = fetchMock
    fetchMock.mockReset()
  })

  test('loads current close date and allows setting and reopening', async () => {
    // Initial settings
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ settings: { closeDate: null } }) })
    // Set close date
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ closed: '2025-01-31' }) })
    // Reopen
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ reopened: true }) })

    render(<CloseBooksPage />)

    // Wait for load
    await screen.findByText(/Closed through:/i)

    // Set date
    const input = screen.getByLabelText(/Close through date/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '2025-01-31' } })

    const setBtn = screen.getByRole('button', { name: /Set close date/i })
    fireEvent.click(setBtn)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/settings/close-period', expect.any(Object)))
    expect(await screen.findByText(/2025-01-31/)).toBeInTheDocument()

    const reopenBtn = screen.getByRole('button', { name: /Reopen/i })
    fireEvent.click(reopenBtn)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/settings/reopen-period', expect.any(Object)))
  })
})
