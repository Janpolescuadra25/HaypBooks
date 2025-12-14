import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'

describe('Invoice per-row description inline resizing', () => {
  beforeEach(() => {
    try { localStorage.removeItem('hb.invoice.rowWidths.v1'); localStorage.removeItem('hb.invoice.productRowWidths.v1') } catch {}
  })

  it('lets you drag the right edge of a description cell to change its width', async () => {
    render(<NewInvoiceForm />)

    // find the first description input and its per-row resizer
    const inputs = await screen.findAllByPlaceholderText('Description')
    expect(inputs.length).toBeGreaterThan(0)
    const descInput = inputs[0] as HTMLInputElement

    // before: input has no explicit px width
    const before = descInput.style.width

    // find resizer for row 0 (there are several separators — pick the one for this row)
    const separators = screen.getAllByRole('separator')
    // choose the separator that matches the per-row label
    const resizer = separators.find(s => /Resize description for row 0/i.test(s.getAttribute('aria-label') || ''))
    if (!resizer) throw new globalThis.Error('description resizer not found')

    act(() => {
      const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100 }) as any
      down.pointerId = 1
      resizer.dispatchEvent(down)

      const move = new Event('pointermove', { bubbles: true }) as any
      move.clientX = 200
      move.pointerId = 1
      window.dispatchEvent(move)

      const up = new Event('pointerup', { bubbles: true }) as any
      up.pointerId = 1
      window.dispatchEvent(up)
    })

    const after = descInput.style.width
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
    expect(after).toMatch(/px$/)
    const w = parseFloat(after.replace('px',''))
    expect(w).toBeGreaterThan(0)

    // also test product/service per-row resizer exists and changes the wrapping width
    const productResizer = separators.find(s => /Resize productService for row 0/i.test(s.getAttribute('aria-label') || ''))
    if (!productResizer) throw new globalThis.Error('product resizer not found')
    const wrapper = (productResizer as Element).parentElement as HTMLElement
    const beforeWrap = productResizer!.getAttribute('aria-valuenow') || window.getComputedStyle(wrapper).width || wrapper.style.width

    act(() => {
      const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 200 }) as any
      down.pointerId = 2
      productResizer!.dispatchEvent(down)

      const move = new Event('pointermove', { bubbles: true }) as any
      move.clientX = 400
      move.pointerId = 2
      window.dispatchEvent(move)

      const up = new Event('pointerup', { bubbles: true }) as any
      up.pointerId = 2
      window.dispatchEvent(up)
    })

    const afterWrap = productResizer!.getAttribute('aria-valuenow') || wrapper.style.width || window.getComputedStyle(wrapper).width
    expect(afterWrap).toBeDefined()
    expect(afterWrap).not.toBe(beforeWrap)
  })

  it('supports keyboard resizing on the per-row separator and updates the input width', async () => {
    render(<NewInvoiceForm />)

    const inputs = await screen.findAllByPlaceholderText('Description')
    const descInput = inputs[0] as HTMLInputElement
    const before = descInput.style.width

    const separators = screen.getAllByRole('separator')
    const resizer = separators.find(s => /Resize description for row 0/i.test(s.getAttribute('aria-label') || ''))
    if (!resizer) throw new globalThis.Error('description resizer not found')

    // focus and nudge via keyboard
    const resizerEl = resizer as HTMLElement
    resizerEl.focus()
    act(() => {
      const ev = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      resizer!.dispatchEvent(ev)
    })

    const after = descInput.style.width
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
    expect(after).toMatch(/px$/)
  })

  it('persists widths to localStorage and rehydrates on mount', async () => {
    render(<NewInvoiceForm />)

    const inputs = await screen.findAllByPlaceholderText('Description')
    const descInput = inputs[0] as HTMLInputElement

    const separators = screen.getAllByRole('separator')
    const resizer = separators.find(s => /Resize description for row 0/i.test(s.getAttribute('aria-label') || ''))
    expect(resizer).toBeTruthy()

    act(() => {
      const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100 }) as any
      down.pointerId = 10
      resizer!.dispatchEvent(down)

      const move = new Event('pointermove', { bubbles: true }) as any
      move.clientX = 300
      move.pointerId = 10
      window.dispatchEvent(move)

      const up = new Event('pointerup', { bubbles: true }) as any
      up.pointerId = 10
      window.dispatchEvent(up)
    })

    // capture style width after change
    const after = descInput.style.width
    expect(after).toMatch(/px$/)

    // unmount and remount, should rehydrate
    const { unmount } = render(<NewInvoiceForm />)
    unmount()
    const { rerender } = render(<NewInvoiceForm />)

    // the re-rendered input should have a px width from persisted localStorage
    const newInputs = await screen.findAllByPlaceholderText('Description')
    const newDescInput = newInputs[0] as HTMLInputElement
    const rehydrated = newDescInput.style.width
    expect(rehydrated).toBeTruthy()
    expect(rehydrated).toBe(after)
  })
})
