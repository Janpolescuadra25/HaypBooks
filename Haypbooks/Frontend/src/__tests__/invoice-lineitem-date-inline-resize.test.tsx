import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import { interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'

describe('Date column inline resizing', () => {
  beforeEach(() => { restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' }) })

  it('renders a per-row resizer for the date cell when the date column is enabled', async () => {
    // enable date column via persisted settings
    try { localStorage.setItem('invoiceSettings', JSON.stringify({ optCols: { date: true } })) } catch {}

    const { container } = render(<NewInvoiceForm />)

    // find a per-row date input (skip the top-level invoice date which has id=inv-date)
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')).filter(i => (i as HTMLInputElement).id !== 'inv-date')
    expect(dateInputs.length).toBeGreaterThan(0)

    // find the inline resizer accessible separators and ensure the date resizer exists
    const separators = screen.getAllByRole('separator')
    const dateResizer = separators.find(s => /Resize date for row 0/i.test(s.getAttribute('aria-label') || ''))
    expect(dateResizer).toBeTruthy()
  })
})
