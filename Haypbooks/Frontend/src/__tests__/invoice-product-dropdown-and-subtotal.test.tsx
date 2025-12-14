import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
// Mock ProductDropdown so tests don't depend on global.fetch or other network state.
jest.mock('@/components/ProductDropdown', () => {
  const React = require('react')
  return function ProductDropdown(props: any) {
    const items: string[] = (global as any).__TEST_PRODUCT_ITEMS__ || []
    const [open, setOpen] = React.useState(false)
    const placeholder = props.placeholder || 'Item…'
    return React.createElement('div', null,
      React.createElement('button', { id: props.id, onClick: () => setOpen((o: boolean) => !o) }, props.value || placeholder),
      open && React.createElement('div', { role: 'listbox' },
        React.createElement('input', { 'aria-label': 'Filter products' }),
        React.createElement('div', null, items.length === 0 ? React.createElement('div', null, 'No items') : items.map((n: string, i: number) => React.createElement('button', { key: i, role: 'option', onClick: () => props.onSelect(n) }, n)))
      )
    )
  }
})

import NewInvoiceForm from '@/components/NewInvoiceForm'
import InvoiceNewAlt from '@/components/invoices/NewInvoiceForm'

const back = jest.fn()
const replace = jest.fn()
const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ back, push, replace }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

function mockProducts(items: string[]) {
  ;(global as any).__TEST_PRODUCT_ITEMS__ = items
}

describe('Product dropdown + subtotal removal', () => {
  beforeEach(() => { jest.clearAllMocks(); localStorage.clear(); (global as any).__TEST_PRODUCT_ITEMS__ = [] })
  afterEach(() => { (global as any).__TEST_PRODUCT_ITEMS__ = [] })

  it('product dropdown in top-level form loads items and selects value', async () => {
    mockProducts(['Service A', 'Good B'])
    // provide test items for mocked ProductDropdown
    mockProducts(['Service A', 'Good B'])
    render(<NewInvoiceForm />)

    // click first row product placeholder
    const itemBtns = await screen.findAllByText(/Item…/i)
    expect(itemBtns.length).toBeGreaterThan(0)
    fireEvent.click(itemBtns[0])

    // wait for items to appear and select the first one (scope to the clicked row so we don't hit other listboxes)
    const row = itemBtns[0].closest('tr') as HTMLElement
    await waitFor(() => expect(within(row).getByRole('listbox')).toBeVisible())
    const opt = await within(row).findByRole('option', { name: /Service A/i })
    fireEvent.click(opt)

    // Now the product label should show the selected value
    expect(await screen.findAllByText(/Service A/i)).toBeTruthy()
  })

  it('customer dropdown closes when invoice page scrolls', async () => {
    mockProducts(['Service A', 'Good B'])
    render(<NewInvoiceForm />)

    // focus the customer input so its dropdown opens
    const input = await screen.findByPlaceholderText(/Select customer…/i)
    fireEvent.focus(input)

    // list should be visible
    expect(await screen.findByRole('listbox')).toBeVisible()

    // find the dialog and its scrollable content area — simulate a page/modal scroll
    const dialog = screen.getByTestId('invoice-dialog') as HTMLElement
    const scrollable = dialog.querySelector('.overflow-y-auto') as HTMLElement | null
    expect(scrollable).not.toBeNull()

    // dispatch a scroll event on the page's scrollable area
    act(() => { const ev = new Event('scroll', { bubbles: true }); scrollable!.dispatchEvent(ev) })

    // dropdown should have closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    // the customer input should have lost focus
    const custInput = await screen.findByPlaceholderText(/Select customer…/i)
    expect(document.activeElement).not.toBe(custInput)
  })

  // product trigger focus tests use mocked ProductDropdown in this file — see separate ProductDropdown tests for real behaviour

  it('product dropdown in invoices variant loads items and selects value', async () => {
    mockProducts(['Alpha', 'Beta'])
    render(<InvoiceNewAlt />)
    const itemButtons = await screen.findAllByText(/Item…/i)
    fireEvent.click(itemButtons[0])
    const row = itemButtons[0].closest('tr') as HTMLElement
    await waitFor(() => expect(within(row).getByRole('listbox')).toBeVisible())
    const opt = await within(row).findByRole('option', { name: /Alpha/i })
    fireEvent.click(opt)
    expect(await screen.findAllByText(/Alpha/i)).toBeTruthy()
  })

  it('can remove a manual subtotal row (top-level)', async () => {
    render(<NewInvoiceForm />)
    // add two lines and a subtotal marker between
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)
    // add subtotal marker
    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)

    // subtotal should exist in the line items table
    const allSubtotal = await screen.findAllByText(/^Subtotal$/i)
    const subtotalCell = allSubtotal.find(s => !!s.closest('table'))
    expect(subtotalCell).toBeInTheDocument()

    // find its row's remove button and click it
    const row = subtotalCell!.closest('tr') as HTMLElement
    const removeBtn = within(row).getByRole('button', { name: /remove subtotal at row/i })
    fireEvent.click(removeBtn)

    // subtotal row should be gone (assert no Subtotal exists inside a table)
    await waitFor(() => expect(screen.queryAllByText(/^Subtotal$/i).filter(el => !!el.closest('table')).length).toBe(0))
  })

  it('can reorder rows using move buttons and subtotals move accordingly', async () => {
    render(<NewInvoiceForm />)
    // Add another line and a subtotal
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)
    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)

    // Fill descriptions so we can assert order
    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    // default line -> index 0
    fireEvent.change(descInputs[0], { target: { value: 'Line A' } })
    fireEvent.change(descInputs[1], { target: { value: 'Line B' } })

    // confirm initial order: Line A, Line B, Subtotal (ensure subtotal exists in table)
    const subtotalCell = screen.getAllByText(/^Subtotal$/i).find(s => !!s.closest('table'))
    expect(subtotalCell).toBeInTheDocument()

    // Move first row down using the button in its drag column
    const firstRow = descInputs[0].closest('tr') as HTMLElement
    const moveDownBtn = within(firstRow).getByRole('button', { name: /Move row down/i })
    fireEvent.click(moveDownBtn)

    // After move, expect Line B then Line A
    await waitFor(() => {
      const descriptions = screen.getAllByPlaceholderText(/Description/i).map(i => (i as HTMLInputElement).value)
      expect(descriptions[0]).toBe('Line B')
      expect(descriptions[1]).toBe('Line A')
    })

    // Now ensure subtotal still exists and is still in table
    const subtotalBefore = screen.getAllByText(/^Subtotal$/i).find(s => !!s.closest('table'))
    expect(subtotalBefore).toBeInTheDocument()
  })

  it('allows keyboard reordering using Arrow keys (top-level)', async () => {
    render(<NewInvoiceForm />)
    // add a second line so we have two lines to reorder
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'A' } })
    fireEvent.change(descInputs[1], { target: { value: 'B' } })

    const firstRow = descInputs[0].closest('tr') as HTMLElement
    const moveCtrl = within(firstRow).getByLabelText(/Row 1 move controls/i)
    fireEvent.focus(moveCtrl)

    // press ArrowDown to move A down
    fireEvent.keyDown(moveCtrl, { key: 'ArrowDown' })

    await waitFor(() => {
      const descriptions = screen.getAllByPlaceholderText(/Description/i).map(i => (i as HTMLInputElement).value)
      expect(descriptions[0]).toBe('B')
      expect(descriptions[1]).toBe('A')
    })

    // aria-live should contain announcement
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Moved row 1 to 2/))
  })

  it('allows dragging a subtotal row to a new position', async () => {
    render(<NewInvoiceForm />)
    // make 2 lines and a subtotal: A, B, SUB
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)
    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)
    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'A' } })
    fireEvent.change(descInputs[1], { target: { value: 'B' } })

    // find the subtotal row element and the B row
    const subtotalCell = screen.getAllByText(/^Subtotal$/i).find(s => !!s.closest('table')) as HTMLElement
    expect(subtotalCell).toBeInTheDocument()
    const subtotalRow = subtotalCell.closest('tr') as HTMLElement
    const bRow = descInputs[1].closest('tr') as HTMLElement

    // drag subtotal over B row (move SUB up one slot) — start drag on the new handle
    const handle = within(subtotalRow).getByLabelText(/Drag row/i)
    fireEvent.dragStart(handle)
    fireEvent.dragOver(bRow)
    fireEvent.drop(bRow)

    // Now the order should be A, Subtotal, B -> subtotal should be between A and B
    await waitFor(() => {
      const table = screen.getByRole('table')
      const bodyRows = Array.from(table.querySelectorAll('tbody tr'))
      // map rows to either description value or the text content (for subtotal)
      const got = bodyRows.map((r: Element) => {
        const input = r.querySelector('input[placeholder="Description"]') as HTMLInputElement | null
        if (input) return input.value
        // find first non-empty cell text instead of assuming the first <td> contains the label
        const cells = Array.from(r.querySelectorAll('td'))
        for (const c of cells) {
          const txt = c.textContent?.trim() || ''
          if (txt) return txt
        }
        return ''
      })
      // Expect ordering A, Subtotal, B (there may be other padding cells but these values should appear in order)
      expect(got).toEqual(expect.arrayContaining(['A', 'Subtotal', 'B']))
      // ensure subtotal is between A and B specifically
      const aIndex = got.indexOf('A'); const subIndex = got.indexOf('Subtotal'); const bIndex = got.indexOf('B')
      expect(aIndex).toBeLessThan(subIndex)
      expect(subIndex).toBeLessThan(bIndex)
    })
  })

  it('invoices variant supports reordering and dragging', async () => {
    render(<InvoiceNewAlt />)
    // add a line and a subtotal
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)
    const addSubtotal = screen.getByRole('button', { name: /add subtotal/i })
    fireEvent.click(addSubtotal)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'X' } })
    fireEvent.change(descInputs[1], { target: { value: 'Y' } })

    // move X down using button
    const firstRow = descInputs[0].closest('tr') as HTMLElement
    const moveDown = within(firstRow).getByRole('button', { name: /Move row down/i })
    fireEvent.click(moveDown)
    await waitFor(() => expect((screen.getAllByPlaceholderText(/Description/i)[0] as HTMLInputElement).value).toBe('Y'))

    // drag subtotal up
    const subtotalCell = screen.getAllByText(/^Subtotal$/i).find(s => !!s.closest('table')) as HTMLElement
    const subtotalRow = subtotalCell.closest('tr') as HTMLElement
    // requery inputs after the move so we target the correct row
    const afterInputs = await screen.findAllByPlaceholderText(/Description/i)
    const xInput = afterInputs.find(i => (i as HTMLInputElement).value === 'X') as HTMLInputElement
    const xRow = xInput.closest('tr') as HTMLElement
    const handle = within(subtotalRow).getByLabelText(/Drag row/i)
    fireEvent.dragStart(handle)
    fireEvent.dragOver(xRow)
    fireEvent.drop(xRow)
    await waitFor(() => {
      const table = screen.getByRole('table')
      const got = Array.from(table.querySelectorAll('tbody tr')).map(r => {
        const input = r.querySelector('input[placeholder="Description"]') as HTMLInputElement | null
        if (input) return input.value
        // find first non-empty cell text (drag handle is now first cell, subtotal text is in a later cell)
        const cells = Array.from(r.querySelectorAll('td'))
        for (const c of cells) {
          const txt = c.textContent?.trim() || ''
          if (txt) return txt
        }
        return ''
      })
      const xIndex = got.indexOf('X')
      const yIndex = got.indexOf('Y')
      const subIdx = got.indexOf('Subtotal')
      expect(subIdx).toBeGreaterThan(Math.min(xIndex, yIndex))
      expect(subIdx).toBeLessThan(Math.max(xIndex, yIndex))
    })
  })

  it('allows keyboard reordering using Arrow keys (invoices variant)', async () => {
    render(<InvoiceNewAlt />)
    const addBtn = screen.getByRole('button', { name: /add lines/i })
    fireEvent.click(addBtn)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'X' } })
    fireEvent.change(descInputs[1], { target: { value: 'Y' } })

    const firstRow = descInputs[0].closest('tr') as HTMLElement
    const moveCtrl = within(firstRow).getByLabelText(/Row 1 move controls/i)
    fireEvent.focus(moveCtrl)
    fireEvent.keyDown(moveCtrl, { key: 'ArrowDown' })

    await waitFor(() => expect((screen.getAllByPlaceholderText(/Description/i)[0] as HTMLInputElement).value).toBe('Y'))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Moved row 1 to 2/))
  })
})
