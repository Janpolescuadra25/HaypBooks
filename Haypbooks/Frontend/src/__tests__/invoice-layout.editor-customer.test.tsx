import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'

describe('InvoiceLayoutPanel Editor/Customer toggle behavior', () => {
  beforeEach(() => localStorage.clear())

  it('enables Editor when Customer toggle is switched on', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /content/i }))

    const skuEditor = screen.getByRole('checkbox', { name: /sku editor view/i }) as HTMLInputElement
    const skuCustomer = screen.getByRole('checkbox', { name: /sku customer view/i }) as HTMLInputElement

    expect(skuEditor.checked).toBe(false)
    expect(skuCustomer.checked).toBe(false)

    // toggle customer on — should auto-enable editor
    fireEvent.click(skuCustomer)
    expect(skuCustomer.checked).toBe(true)
    expect(skuEditor.checked).toBe(true)
  })

  it('shows a help popover with explanation', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /content/i }))

    const helpBtn = screen.getByRole('button', { name: /show visibility help/i }) as HTMLButtonElement
    expect(helpBtn).toBeInTheDocument()

    fireEvent.click(helpBtn)
    // Popover should render dialog with the header text
    expect(screen.getByRole('dialog', { name: /invoice field visibility help/i })).toBeInTheDocument()
    expect(screen.getByText(/Editor vs Customer visibility/i)).toBeInTheDocument()
  })

  it('turning Editor off clears Customer toggle', () => {
    render(<InvoiceLayoutPanel />)
    fireEvent.click(screen.getByRole('button', { name: /content/i }))

    const skuEditor = screen.getByRole('checkbox', { name: /sku editor view/i }) as HTMLInputElement
    const skuCustomer = screen.getByRole('checkbox', { name: /sku customer view/i }) as HTMLInputElement

    // enable both first
    if (!skuEditor.checked) fireEvent.click(skuEditor)
    if (!skuCustomer.checked) fireEvent.click(skuCustomer)

    expect(skuEditor.checked).toBe(true)
    expect(skuCustomer.checked).toBe(true)

    // now disable editor — expect customer cleared
    fireEvent.click(skuEditor)
    expect(skuEditor.checked).toBe(false)
    expect(skuCustomer.checked).toBe(false)
  })
})
