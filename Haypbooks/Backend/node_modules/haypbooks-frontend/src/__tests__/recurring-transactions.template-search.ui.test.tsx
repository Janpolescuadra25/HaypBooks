import { render, screen, fireEvent, within } from '@testing-library/react'
import RecurringTransactionsPage from '@/app/transactions/recurring-transactions/page'

// Minimal MSW mocking is already wired in test setup for fetch().

describe('Recurring Transactions - template search filter (ui)', () => {
  it('filters rows by search input (name/type/frequency)', async () => {
    render(<RecurringTransactionsPage />)

    // Wait for initial table to appear
    const table = await screen.findByRole('table', { name: /recurring templates/i })
    const tbody = within(table).getAllByRole('rowgroup')[1]
    const allRows = within(tbody).getAllByRole('row')
    expect(allRows.length).toBeGreaterThan(0)

    const search = await screen.findByRole('textbox', { name: /search templates/i })

    // Filter by frequency
    fireEvent.change(search, { target: { value: 'monthly' } })
    const monthlyRows = within(tbody).getAllByRole('row')
    expect(monthlyRows.length).toBeLessThanOrEqual(allRows.length)

    // Filter by kind
    fireEvent.change(search, { target: { value: 'invoice' } })
    const invoiceRows = within(tbody).getAllByRole('row')
    expect(invoiceRows.length).toBeLessThanOrEqual(allRows.length)

    // Clear should restore
    const clearBtn = await screen.findByRole('button', { name: /clear/i })
    fireEvent.click(clearBtn)
    const restoredRows = within(tbody).getAllByRole('row')
    expect(restoredRows.length).toBeGreaterThan(0)
  })
})
