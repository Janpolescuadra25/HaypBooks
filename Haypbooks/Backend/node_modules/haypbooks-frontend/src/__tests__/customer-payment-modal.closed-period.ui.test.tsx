import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import RecordCustomerPaymentModal from '@/components/RecordCustomerPaymentModal'
import { ToastProvider } from '@/components/ToastProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

const today = new Date().toISOString().slice(0,10)

describe('RecordCustomerPaymentModal - closed period UI', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/api/periods')) {
        return Promise.resolve({ ok: true, json: async () => ({ closedThrough: today }) } as any)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any)
    })
    // @ts-ignore
    global.fetch = fetchMock
  })

  test('disables submit and shows inline message when date is blocked', async () => {
    const onClose = jest.fn()
    const onApplied = jest.fn()
    render(
      <ToastProvider>
        <CurrencyProvider>
          <RecordCustomerPaymentModal
            customerId="c_1"
            customerName="Acme"
            invoices={[{ id: 'i_1', number: 'INV-1', balance: 100 }]}
            onClose={onClose}
            onApplied={onApplied}
          />
        </CurrencyProvider>
      </ToastProvider>
    )

  // Banner about closed-through
  await waitFor(() => expect(screen.getByText(/Payments dated on or before this date will be blocked/i)).toBeInTheDocument())
  // Inline hint under date
  expect(screen.getByText(/Selected date is within a closed period/i)).toBeInTheDocument()

    // Ensure the Save button is disabled when using today's date (blocked)
    const saveBtn = await screen.findByRole('button', { name: /Save Payment/i })
    expect(saveBtn).toBeDisabled()

  // When the date is set to future beyond closedThrough and a valid amount is entered, the button should enable
    const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
    const future = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10)
    fireEvent.change(dateInput, { target: { value: future } })
  const amountInput = screen.getByLabelText(/Amount Received/i) as HTMLInputElement
  fireEvent.change(amountInput, { target: { value: '10.00' } })
  await waitFor(() => expect(saveBtn).not.toBeDisabled())
  })
})
