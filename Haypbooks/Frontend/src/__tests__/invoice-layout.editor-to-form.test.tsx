import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'
import { fireEvent } from '@testing-library/react'
import { DEFAULT_LAYOUT } from '@/types/invoiceLayout'

function setLayout(obj: any) {
  localStorage.setItem('hb.invoice.layout', JSON.stringify(obj))
}

describe('Editor toggles affect New Invoice form visibility', () => {
  beforeEach(() => {
    localStorage.clear()
    // Ensure fetch does not intercept and instead fallback to localStorage during tests
    ;(global as any).fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('no network')))
  })

  it('shows or hides Shipping address in the editor according to the Editor toggle', async () => {
    // When the layout has the Editor flag OFF the Shipping textarea should not be present in the New Invoice form
    setLayout({ ...DEFAULT_LAYOUT, showShippingAddressEditor: false, showShippingAddressCustomer: false })
    render(<NewInvoiceForm />)
    await waitFor(() => expect(screen.queryByLabelText(/Shipping address/i)).not.toBeInTheDocument())

    // When the layout enables the Editor flag the Shipping textarea should be present
    setLayout({ ...DEFAULT_LAYOUT, showShippingAddressEditor: true, showShippingAddressCustomer: false })
    render(<NewInvoiceForm />)
    expect(await screen.findByLabelText(/Shipping address/i)).toBeInTheDocument()
  })

  it('always shows Invoice # in the editor', async () => {
    // Editor no-toggle: Invoice # should appear regardless of saved layout flags
    setLayout({ ...DEFAULT_LAYOUT, showInvoiceNumberEditor: false, showInvoiceNumberCustomer: false })
    render(<NewInvoiceForm />)
    expect(await screen.findByLabelText(/Invoice #/i)).toBeInTheDocument()
  })

  it('always shows Invoice date in the editor', async () => {
    setLayout({ ...DEFAULT_LAYOUT, showInvoiceDateEditor: false, showInvoiceDateCustomer: false })
    render(<NewInvoiceForm />)
    // match the exact Invoice Date field label (avoid matching 'Due Date')
    expect(await screen.findByLabelText(/^Date$/i)).toBeInTheDocument()
  })

  it('respects Service date editor toggle and still shows SKU column when SKU editor is on', async () => {
    // When the Service date editor toggle is off the Date optional column should not appear in the editor.
    setLayout({ ...DEFAULT_LAYOUT, showServiceDateEditor: false, showSKUEditor: true, showSKU: true })
    render(<NewInvoiceForm />)
    // Date column should be absent
    await waitFor(() => expect(screen.queryByRole('columnheader', { name: /\bDate\b/i })).not.toBeInTheDocument())
    // SKU column remains present because SKU editor toggle is on
    expect(await screen.findByRole('columnheader', { name: /SKU/i })).toBeInTheDocument()
  })

  it('always shows Sales Tax fields in the editor', async () => {
    // tax summary is always visible in editor
    setLayout({ ...DEFAULT_LAYOUT, showTaxSummaryEditor: false, showTaxSummaryCustomer: false })
    render(<NewInvoiceForm />)
    expect(await screen.findByText(/Sales Tax %/i)).toBeInTheDocument()
  })

  it('shows Tags editor and Discount (editor-visible)', async () => {
    // Tags are editor-toggleable; Discount is always shown in editor
    setLayout({ ...DEFAULT_LAYOUT, showTagsEditor: true, showTagsCustomer: true, showDiscountEditor: false, showDiscountCustomer: false })
    render(<NewInvoiceForm />)
    // expect the Manage Tags link (TagSelect control isn't always accessible by label)
    expect(await screen.findByRole('link', { name: /manage tags/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Discount %/i)).toBeInTheDocument()
  })

  it('lets Editor enter Shipping/Other and updates totals', async () => {
    // The editor-visible shipping amount is controlled by showShippingEditor
    setLayout({ ...DEFAULT_LAYOUT, showShippingEditor: true })
    render(<NewInvoiceForm />)
    // find the shipping amount input (now labelled Shipping/Other) and ensure changing it updates the displayed shipping total
    const shipInput = await screen.findByLabelText(/^Shipping\/others$/i) as HTMLInputElement
    expect(shipInput).toBeInTheDocument()
    fireEvent.change(shipInput, { target: { value: '25' } })
    // the totals panel shows the shipping amount with a + sign
    expect(await screen.findByText(/\+25.00/)).toBeInTheDocument()
  })
})
