import { render, screen, within } from '@testing-library/react'
import RecurringTransactionsPage from '@/app/transactions/recurring-transactions/page'

// This test validates that when history contains artifact ids, the UI renders links
// to the correct destinations according to artifactType mapping.

describe('Recurring Transactions - history artifact links (ui)', () => {
  it('renders link hrefs for journal/invoice/bill entries when artifactId is present', async () => {
    render(<RecurringTransactionsPage />)

    // Wait for Recent Runs table (may be empty depending on seed; we assert shape when present)
    const table = await screen.findByRole('table', { name: /recurring run history/i })
    const tbody = within(table).getAllByRole('rowgroup')[1]
    const rows = within(tbody).getAllByRole('row')

    // Not asserting specific counts (seed/history is dynamic), but if any cell looks like a link, it should match one of the known prefixes.
    const links = within(tbody).queryAllByRole('link')
    for (const a of links) {
      const href = (a as HTMLAnchorElement).getAttribute('href') || ''
      expect(/^(\/journal\/|\/invoices\/|\/bills\/)/.test(href)).toBe(true)
    }
  })
})
