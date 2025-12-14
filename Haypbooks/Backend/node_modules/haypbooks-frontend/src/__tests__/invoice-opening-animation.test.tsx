import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import InvoiceNewAlt from '@/components/invoices/NewInvoiceForm'

jest.mock('next/navigation', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

describe('New Invoice opening animation', () => {
  beforeEach(() => { localStorage.clear() })

  it('top-level NewInvoiceForm animates in on mount', async () => {
    render(<NewInvoiceForm />)
    const dialog = screen.getByTestId('invoice-dialog')
    expect(dialog).toBeInTheDocument()
    await waitFor(() => expect(dialog.className).toMatch(/opacity-100/))
    expect(dialog.className).toMatch(/scale-100/)
  })

  it('invoices/NewInvoiceForm animates in on mount', async () => {
    render(<InvoiceNewAlt />)
    const dialog = screen.getByTestId('invoice-dialog')
    expect(dialog).toBeInTheDocument()
    await waitFor(() => expect(dialog.className).toMatch(/opacity-100/))
    expect(dialog.className).toMatch(/scale-100/)
  })
})
