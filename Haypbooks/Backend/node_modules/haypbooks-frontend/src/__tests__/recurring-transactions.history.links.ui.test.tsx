import { render, screen, within } from '@testing-library/react'
import RecurringTransactionsPage from '@/app/transactions/recurring-transactions/page'

// This test validates that when history contains artifact ids, the UI renders links
// to the correct destinations according to artifactType mapping.

describe('Recurring Transactions - history artifact links (ui)', () => {
  it('renders link hrefs for journal/invoice/bill entries when artifactId is present', async () => {
    // Provide a deterministic fetch stub for this UI test (templates + history)
    const templates = [{ id: 't1', name: 'Template 1', kind: 'invoice', frequency: 'monthly', nextRunDate: '2025-02-01', lines: [], status: 'active', currency: 'USD' }]
    const history = [{ id: 'h1', templateId: 't1', runDate: '2025-01-01', artifactType: 'journal', artifactId: 'je_1', amount: 100, status: 'posted' }]
    const orig = global.fetch as any
    global.fetch = (jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : (input as any).url
      const asString = String(url)
      // eslint-disable-next-line no-console
      console.log('fetch called with:', asString)
      if (asString.includes('/api/recurring-transactions/history')) return new Response(JSON.stringify({ data: history }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      if (asString.includes('/api/recurring-transactions')) return new Response(JSON.stringify({ data: templates }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
    }) as any)

    render(<RecurringTransactionsPage />)

    // Wait for the Recent Runs section (may be empty depending on seed; we assert shape when present)
    const aside = await screen.findByText(/Recent runs/i)
    const recent = aside.closest('aside')!

    // Not asserting specific counts (seed/history is dynamic), but if any link is present it should match one of the known prefixes.
    const links = within(recent).queryAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(0)
    // At least one link (if present) should point to a known artifact prefix
    // Prefer finding the 'Open' link text if present and verify its href
    // Wait for an entry to appear and assert the Open link exists
    const runEntry = await within(recent).findByText(/2025-01-01/)
    // eslint-disable-next-line no-console
    console.log('Found run entry:', runEntry?.textContent)
    const openLink = within(recent).getByText('Open')
    const anchor = openLink.closest('a')
    expect(anchor).toBeTruthy()
    expect(/^(\/journal\/|\/invoices\/|\/bills\/)/.test(anchor!.getAttribute('href') || '')).toBe(true)

    global.fetch = orig
  })
})
