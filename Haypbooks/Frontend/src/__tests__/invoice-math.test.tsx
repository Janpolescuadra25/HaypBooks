import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import InvoiceNewAlt from '@/components/invoices/NewInvoiceForm'

const back = jest.fn()
const replace = jest.fn()
const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ back, push, replace }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

describe('Invoice totals math (exclusive/inclusive/discount-after-tax)', () => {
  beforeEach(() => { jest.clearAllMocks(); localStorage.clear() })

  async function setLineAmount(index: number, qty: string, rate: string, taxable = false) {
    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    const row = descInputs[index].closest('tr') as HTMLElement
    const spinbuttons = within(row).getAllByRole('spinbutton')
    fireEvent.change(spinbuttons[0], { target: { value: qty } })
    fireEvent.change(spinbuttons[1], { target: { value: rate } })
    const taxCheckbox = within(row).queryByRole('checkbox') as HTMLInputElement
    if (!!taxable !== !!taxCheckbox?.checked) {
      fireEvent.click(taxCheckbox)
    }
  }

  function getSummaryValue(labelRegex: RegExp) {
    const matches = screen.getAllByText(labelRegex)
    // pick the one that sits outside the lines table
    const el = matches.find(m => !m.closest('table'))
    if (!el) throw new Error('summary label not found: ' + labelRegex)
    const row = el.closest('div') as HTMLElement
    const value = within(row).getByText(/\d+\.\d{2}/)
    return value.textContent?.trim()
  }

  function getRowValueByLabel(labelRegex: RegExp) {
    const matches = screen.getAllByText(labelRegex)
    const el = matches.find(m => !m.closest('table'))
    if (!el) throw new Error('label not found: ' + labelRegex)
    const row = el.closest('div') as HTMLElement
    const maybe = Array.from(row.querySelectorAll('span')).map(s => s.textContent || '').find(t => /\d+\.\d{2}/.test(t || ''))
    if (!maybe) throw new Error('no numeric value found for label: ' + String(labelRegex))
    // normalize numeric text by stripping a leading + sign
    return (maybe || '').replace(/^\+/, '').trim()
  }

  it('exclusive tax: subtotal, taxable subtotal, tax, total compute correctly (top-level)', async () => {
    render(<NewInvoiceForm />)

    // first line 2 * 10 taxable
    await setLineAmount(0, '2', '10', true)
    // add another line 1 * 5 non-taxable
    fireEvent.click(screen.getByRole('button', { name: /add lines/i }))
    await setLineAmount(1, '1', '5', false)

    // set tax pct to 10
    const taxInput = screen.getByLabelText(/Sales Tax %/i)
    fireEvent.change(taxInput, { target: { value: '10' } })

    // Subtotal should be 25.00, taxable subtotal 20.00, tax 2.00, total 27.00
    expect(getSummaryValue(/^Subtotal$/i)).toBe('25.00')
    expect(getSummaryValue(/^Taxable Subtotal$/i)).toBe('20.00')
    // tax row appears in the Sales Tax % label line — grab the numeric and normalize
    expect(getRowValueByLabel(/^Sales Tax %/i)).toBe('2.00')
    expect(getSummaryValue(/^Total$/i)).toBe('27.00')
  })

  // apply-discount-after-tax scenarios are covered by layout integration tests and the deriveTotals logic unit tests

  it('inclusive amounts mode keeps total equal to input amounts (invoices variant)', async () => {
    render(<InvoiceNewAlt />)

    // single taxable line with amount 110 (qty 1 rate 110) and taxPct 10
    await setLineAmount(0, '1', '110', true)

    // switch amounts mode to Inclusive of Tax
    const amountsSelect = screen.getByLabelText(/Amounts are/i) as HTMLSelectElement
    fireEvent.change(amountsSelect, { target: { value: 'inclusive' } })

    // set tax to 10
    fireEvent.change(screen.getByLabelText(/Sales Tax %/i), { target: { value: '10' } })

    // total should match the visible amount (110.00)
    await waitFor(() => expect(getSummaryValue(/^Total$/i)).toBe('110.00'))
  })
})
