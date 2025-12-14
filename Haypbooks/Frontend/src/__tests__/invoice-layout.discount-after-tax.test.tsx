import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'

describe('InvoiceLayoutPanel discount-after-tax dependency', () => {
  beforeEach(() => localStorage.clear())

  it('shows applyDiscountAfterTax and Discount customer view controls', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /content/i }))

    // Discount editor isn't a toggle (it's always visible). Ensure there's no editor checkbox
    expect(screen.queryByRole('checkbox', { name: /discount editor/i })).not.toBeInTheDocument()

    // The 'apply discount after sales tax' option should be present and interactable
    const after = screen.getByRole('checkbox', { name: /apply discount after sales tax/i }) as HTMLInputElement
    if (!after.checked) fireEvent.click(after)
    expect(after).toBeChecked()

    // Toggling the customer visibility for Discount should not remove the apply-after-tax option
    const discountCust = screen.getByRole('checkbox', { name: /discount customer view/i }) as HTMLInputElement
    if (discountCust.checked) fireEvent.click(discountCust)
    expect(after).toBeInTheDocument()
  })
})
