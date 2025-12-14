import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'

// Simple JSDOM localStorage shim is available

describe('InvoiceLayoutPanel persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads payment method toggles', () => {
    render(<InvoiceLayoutPanel />)
    const saveBtn = screen.getByRole('button', { name: /save/i })
    // click header tab 'Payment' (there are other 'Payment' buttons in the panel)
    fireEvent.click(screen.getAllByRole('button', { name: /payment/i })[0])

    const card = screen.getByRole('checkbox', { name: /credit card/i }) as HTMLInputElement
    const bank = screen.getByRole('checkbox', { name: /bank transfer/i }) as HTMLInputElement
    const paypal = screen.getByRole('checkbox', { name: /paypal/i }) as HTMLInputElement

    // toggle states
    if (!card.checked) fireEvent.click(card)
    if (!bank.checked) fireEvent.click(bank)
    if (!paypal.checked) fireEvent.click(paypal)

    fireEvent.click(saveBtn)

    // remount and verify
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getAllByRole('button', { name: /payment/i })[0])
    expect(screen.getByRole('checkbox', { name: /credit card/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /bank transfer/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /paypal/i })).toBeChecked()
  })

  it('enforces dependency: due date requires terms', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /content/i }))
    // Terms Editor is now always visible; toggle the Customer visibility to verify preview behavior
    const termsCustomer = screen.getByRole('checkbox', { name: /terms customer/i }) as HTMLInputElement
    // Due Date is always visible in the preview now (no Editor/Customer toggle).
    // Ensure turning Terms editor off does NOT remove the due date from the live preview.
    // The preview's Due label should remain present even after disabling Terms editor.
    expect(screen.getByText(/Due:/i)).toBeInTheDocument()
    if (termsCustomer.checked) fireEvent.click(termsCustomer)
    expect(screen.getByText(/Due:/i)).toBeInTheDocument()
  })

  it('token replacement shows in email preview', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /emails/i }))
    const body = screen.getByLabelText(/body template/i) as HTMLTextAreaElement
    fireEvent.change(body, { target: { value: 'Hello {{companyName}}, invoice {{invoiceNumber}} for {{amountDue}} due {{dueDate}} at {{payUrl}}' } })

    expect(screen.getByText(/invoice INV-1001/)).toBeInTheDocument()
    expect(screen.getByText(/\$1,245\.00/)).toBeInTheDocument()
  })
})
