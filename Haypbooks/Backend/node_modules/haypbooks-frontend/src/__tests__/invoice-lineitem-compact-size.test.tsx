import React from 'react'
import { render, screen } from '@testing-library/react'
import { interceptActWarnings, restoreActWarningInterception } from '@/test-utils/act-helpers'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'

describe('Line-item compact sizing', () => {
  beforeEach(() => { restoreActWarningInterception(); interceptActWarnings({ mode: 'collect' }) })
  test('main NewInvoiceForm applies compact class to key line-item inputs', async () => {
    const { container } = render(<NewInvoiceForm />)
    // Description input should have the compact class
    const desc = container.querySelector('input[placeholder="Description"]')
    expect(desc).toBeTruthy()
    expect(desc).toHaveClass('line-item-input--compact')

    // Class input should have the compact class
    const cls = container.querySelector('input[placeholder="Class"]')
    expect(cls).toBeTruthy()
    expect(cls).toHaveClass('line-item-input--compact')

    // Read-only amount field (line totals) should also be compact-styled
    const amount = Array.from(container.querySelectorAll('input[readonly]')).find(i => i.classList.contains('text-right'))
    expect(amount).toBeTruthy()
    expect(amount).toHaveClass('line-item-input--compact')
  })

// NOTE: We keep these tests focused and light-weight by checking the main
// NewInvoiceForm rendering. The alternate invoices/NewInvoiceForm variant
// is very similar and is covered by separate suites; keeping this file
// simple avoids extra side-effects during mount in JSDOM.
})
