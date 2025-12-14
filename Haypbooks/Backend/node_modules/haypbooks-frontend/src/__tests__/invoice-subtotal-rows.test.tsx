import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import InvoiceNewAlt from '@/components/invoices/NewInvoiceForm'

const back = jest.fn()
const replace = jest.fn()
const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ back, push, replace }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

describe('Invoice table subtotal rendering', () => {
  beforeEach(() => { jest.clearAllMocks(); localStorage.clear() })

  it('renders subtotal rows in the top-level NewInvoiceForm', async () => {
    render(<NewInvoiceForm />)

    // Set values on first line
    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    const row0 = descInputs[0].closest('tr') as HTMLElement
    const spin0 = within(row0).getAllByRole('spinbutton')
    // qty then rate
    fireEvent.change(spin0[0], { target: { value: '2' } })
    fireEvent.change(spin0[1], { target: { value: '10' } })

    // add a line and set values
    const addLineBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addLineBtn)
    const descAfter = await screen.findAllByPlaceholderText(/Description/i)
    const row1 = descAfter[1].closest('tr') as HTMLElement
    const spin1 = within(row1).getAllByRole('spinbutton')
    fireEvent.change(spin1[0], { target: { value: '1' } })
    fireEvent.change(spin1[1], { target: { value: '5' } })

    // add a subtotal marker
    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)

    // find the line items table and assert there's a subtotal row in it
    // There are multiple 'Subtotal' labels in the page (line-items area and totals column) - find the one inside the lines table
    const allSubtotal = screen.getAllByText(/^Subtotal$/i)
    const subtotalCell = allSubtotal.find(s => !!s.closest('table'))
    expect(subtotalCell).toBeInTheDocument()

    // subtotal should equal 2*10 + 1*5 = 25.00
    const subtotalAmount = within(subtotalCell!.closest('tr') as HTMLElement).getByText('25.00')
    expect(subtotalAmount).toBeInTheDocument()
  })

  it('renders subtotal rows in invoices/NewInvoiceForm', async () => {
    render(<InvoiceNewAlt />)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    const row0 = descInputs[0].closest('tr') as HTMLElement
    const spin0 = within(row0).getAllByRole('spinbutton')
    fireEvent.change(spin0[0], { target: { value: '3' } })
    fireEvent.change(spin0[1], { target: { value: '7' } })

    const addLineBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addLineBtn)
    const descAfter = await screen.findAllByPlaceholderText(/Description/i)
    const row1 = descAfter[1].closest('tr') as HTMLElement
    const spin1 = within(row1).getAllByRole('spinbutton')
    fireEvent.change(spin1[0], { target: { value: '1' } })
    fireEvent.change(spin1[1], { target: { value: '2' } })

    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)

    const allSubtotal = screen.getAllByText(/^Subtotal$/i)
    const subtotalCell = allSubtotal.find(s => !!s.closest('table'))
    expect(subtotalCell).toBeInTheDocument()
    expect(subtotalCell).toBeInTheDocument()

    // subtotal should equal 3*7 + 1*2 = 23.00
    const subtotalAmount = within(subtotalCell!.closest('tr') as HTMLElement).getByText('23.00')
    expect(subtotalAmount).toBeInTheDocument()
  })
})
