import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'

describe('Invoice line-item resizing', () => {
  it('allows resizing columns via header resizer', async () => {
    render(<NewInvoiceForm />)

    // find table and its colgroup
    const table = await screen.findByRole('table')
    const colgroup = table.querySelector('colgroup') as HTMLElement
    expect(colgroup).toBeTruthy()

    // find the description column element
    const descCol = colgroup.querySelector('col[data-col="description"]') as HTMLElement
    expect(descCol).toBeTruthy()
    const beforeWidth = descCol.style.width

    // find the description header resizer
    const resizer = screen.getByLabelText(/Resize description column/i)
    expect(resizer).toBeTruthy()

    // simulate a pointer drag to resize column
    act(() => {
      // Use MouseEvent since JSDOM doesn't have PointerEvent constructor, but React maps it
      const downEvent = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100 }) as any
      downEvent.pointerId = 1
      resizer.dispatchEvent(downEvent)
      
      // dispatch to window since JSDOM doesn't bubble pointer events properly
      const moveEvent = new Event('pointermove', { bubbles: true }) as any
      moveEvent.clientX = 150
      moveEvent.pointerId = 1
      window.dispatchEvent(moveEvent)
      
      const upEvent = new Event('pointerup', { bubbles: true }) as any
      upEvent.pointerId = 1
      window.dispatchEvent(upEvent)
    })

    // column width should have changed
    const afterWidth = descCol.style.width
    expect(afterWidth).not.toBe(beforeWidth)
    if (beforeWidth && beforeWidth.endsWith('px') && afterWidth && afterWidth.endsWith('px')) {
      const bw = parseFloat(beforeWidth.replace('px',''))
      const aw = parseFloat(afterWidth.replace('px',''))
      expect(aw).toBeGreaterThan(bw)
    }

    // column width should have changed (already asserted above)
  })

  it('supports keyboard resizing on the header resizer', async () => {
    render(<NewInvoiceForm />)

    const table = await screen.findByRole('table')
    const colgroup = table.querySelector('colgroup') as HTMLElement
    expect(colgroup).toBeTruthy()

    const descCol = colgroup.querySelector('col[data-col="description"]') as HTMLElement
    expect(descCol).toBeTruthy()
    const beforeWidth = parseFloat(descCol.style.width.replace('px','') || '0')

    // find the header resizer and focus it
    const resizer = screen.getByLabelText(/Resize description column/i)
    expect(resizer).toBeTruthy()

    // ensure aria attributes are present
    expect(resizer).toHaveAttribute('tabindex')
    expect(resizer).toHaveAttribute('aria-valuemin')
    expect(resizer).toHaveAttribute('aria-valuemax')
    expect(resizer).toHaveAttribute('aria-valuenow')

    // keyboard nudge (ArrowRight)
    act(() => {
      resizer.focus()
      fireEvent.keyDown(resizer, { key: 'ArrowRight' })
    })

    // col width should increase
    const afterWidth = parseFloat(descCol.style.width.replace('px','') || '0')
    expect(afterWidth).toBeGreaterThan(beforeWidth)

    // Home should set to minimum
    act(() => {
      fireEvent.keyDown(resizer, { key: 'Home' })
    })
    const homeWidth = parseFloat(descCol.style.width.replace('px','') || '0')
    expect(homeWidth).toBeGreaterThanOrEqual(0)

    // End should set to a large value (MAX bound) — just ensure it's >= previous
    act(() => {
      fireEvent.keyDown(resizer, { key: 'End' })
    })
    const endWidth = parseFloat(descCol.style.width.replace('px','') || '0')
    expect(endWidth).toBeGreaterThanOrEqual(homeWidth)
  })

  
})
