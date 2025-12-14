import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import InvoiceNewAlt from '@/components/invoices/NewInvoiceForm'

const back = jest.fn()
const replace = jest.fn()
const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ back, push, replace }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

describe('Invoice discard confirmation modal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('opens modal when Cancel clicked while form is dirty and Cancel closes modal', async () => {
    render(<NewInvoiceForm />)

    // Modify the first description to make the form dirty
    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    expect(descInputs.length).toBeGreaterThan(0)
    fireEvent.change(descInputs[0], { target: { value: 'Changed desc' } })

    // Click the Cancel button
    const cancelBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(cancelBtn)

    // Modal should appear
    const modal = await screen.findByRole('dialog', { name: /discard unsaved invoice changes/i })
    expect(modal).toBeInTheDocument()

    // Ensure underlying actions are blocked
    const saveSendBtn = screen.getByRole('button', { name: /save & send/i })
    fireEvent.click(saveSendBtn)
    expect(push).not.toHaveBeenCalled()
    fireEvent.click(cancelBtn)
    expect(back).not.toHaveBeenCalled()

    // (re-checked below) nothing should call router while modal is visible

    // Click Cancel within modal -> should close (allow for exit animation)
    const cancelInModal = within(modal).getByRole('button', { name: /^cancel$/i })
    fireEvent.click(cancelInModal)
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /discard unsaved invoice changes/i })).not.toBeInTheDocument())
    expect(back).not.toHaveBeenCalled()

    // Open again and click the overlay area (background) to cancel
    fireEvent.click(cancelBtn)
    const modal2 = await screen.findByRole('dialog', { name: /discard unsaved invoice changes/i })
    expect(modal2).toBeInTheDocument()
    const overlay = screen.getByTestId('discard-overlay')
      // overlay is present, should be mounted on document.body (portal), and should close the dialog on click
      expect(overlay).toBeInTheDocument()
      expect(overlay.className).toContain('fixed')
      // ensure the overlay is in document.body (portal)
      expect(overlay.parentElement).toBe(document.body)
      fireEvent.click(overlay)
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /discard unsaved invoice changes/i })).not.toBeInTheDocument())
    expect(back).not.toHaveBeenCalled()
  })

  it('discard changes triggers router.back', async () => {
    render(<NewInvoiceForm />)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'Dirty now' } })

    const cancelBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(cancelBtn)

    const modal = await screen.findByRole('dialog', { name: /discard unsaved invoice changes/i })
    const discardBtn = within(modal).getByRole('button', { name: /discard changes/i })
    fireEvent.click(discardBtn)
    await waitFor(() => expect(back).toHaveBeenCalled())
  })

  it('alternate invoices/NewInvoiceForm behaves the same', async () => {
    render(<InvoiceNewAlt />)

    const descInputs = await screen.findAllByPlaceholderText(/Description/i)
    fireEvent.change(descInputs[0], { target: { value: 'Alt dirty' } })

    const cancelBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(cancelBtn)

    const modal = await screen.findByRole('dialog', { name: /discard unsaved invoice changes/i })
    expect(modal).toBeInTheDocument()

    // block underlying actions while modal visible
    const saveSendBtn = screen.getByRole('button', { name: /save & send/i })
    fireEvent.click(saveSendBtn)
    expect(push).not.toHaveBeenCalled()
    fireEvent.click(cancelBtn)
    expect(back).not.toHaveBeenCalled()

    const discardBtn = within(modal).getByRole('button', { name: /discard changes/i })
    const overlay = screen.getByTestId('discard-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay.className).toContain('fixed')
    expect(overlay.parentElement).toBe(document.body)
    // the discard dialog component should also be portaled
    const dialog = screen.getByRole('dialog', { name: /discard unsaved invoice changes/i })
    expect(dialog.parentElement).toBe(document.body)
    fireEvent.click(discardBtn)
    await waitFor(() => expect(back).toHaveBeenCalled())
  })
})
