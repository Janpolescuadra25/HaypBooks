import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
import CustomerDropdown from '@/components/CustomerDropdown'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/', useSearchParams: () => new URLSearchParams('') }))

describe('CustomerDropdown', () => {
  const customers = [{ id: 'c1', name: 'Acme Co' }, { id: 'c2', name: 'Beta LLC' }]

  it('renders placeholder and shows list when focused/toggled', () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c1" value={''} onSelect={onSelect} customers={customers} />)

    const input = screen.getByPlaceholderText(/select/i)
    expect(input).toBeInTheDocument()
    fireEvent.focus(input)

    // list options should appear
    const option = screen.getByRole('option', { name: /Acme Co/i })
    expect(option).toBeInTheDocument()
  })

  it('selecting an option calls onSelect and closes', () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c2" value={''} onSelect={onSelect} customers={customers} />)

    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.focus(input)
    const option = screen.getByRole('option', { name: /Beta LLC/i })
    fireEvent.click(option)
    expect(onSelect).toHaveBeenCalledWith('c2')
  })

  it('Add new opens the inline create customer modal', async () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c3" value={''} onSelect={onSelect} customers={customers} />)

    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.focus(input)
    const addNew = screen.getByRole('button', { name: /add new/i })
    fireEvent.click(addNew)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('keyboard navigation highlights options and Enter selects', () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c4" value={''} onSelect={onSelect} customers={customers} />)

    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    // After pressing ArrowDown while closed, component opens and first item is active
    const firstOpt = screen.getByRole('option', { name: /Acme Co/i })
    expect(firstOpt).toHaveAttribute('aria-selected', 'true')

    // Move down to second
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const secondOpt = screen.getByRole('option', { name: /Beta LLC/i })
    expect(secondOpt).toHaveAttribute('aria-selected', 'true')

    // Press Enter should select the active option
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('c2')
  })

  it('typing a non-existent customer shows add-new CTA with name', async () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c5" value={''} onSelect={onSelect} customers={customers} />)
    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Gamma' } })

    expect(screen.getByText(/No customers match/i)).toBeInTheDocument()

    const addNew = screen.getByRole('button', { name: /add new customer "Gamma"/i })
    fireEvent.click(addNew)

    // modal should open with the name prefilled
    const dialog = await screen.findByRole('dialog', { name: /new customer/i })
    expect(dialog).toBeInTheDocument()
    // verify the overlay/backdrop exists and dialog has a shadow, and overlay is visible
    const overlay = document.querySelector('[data-testid="create-customer-overlay"]') as HTMLElement
    expect(overlay).toBeInTheDocument()
    await waitFor(() => expect(overlay.className).toEqual(expect.stringContaining('opacity-100')))
    expect(dialog.className).toEqual(expect.stringContaining('shadow-['))
    const name = dialog.querySelector<HTMLInputElement>('#name')
    expect(name).toBeTruthy()
    expect(name?.value).toBe('Gamma')

    // stub create API and check onSelect receives created id
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'new123', name: 'Gamma' }) } as any)
    const save = screen.getByRole('button', { name: /save/i })
    fireEvent.click(save)
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('new123'))
  })

  it('closes the list when user scrolls the page', () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c6" value={''} onSelect={onSelect} customers={customers} />)
    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.focus(input)
    // ensure option visible
    expect(screen.getByRole('option', { name: /Acme Co/i })).toBeInTheDocument()

    // simulate page scroll — Popover should close on window scroll
    act(() => window.dispatchEvent(new Event('scroll')))

    // options should no longer be present
    expect(screen.queryByRole('option', { name: /Acme Co/i })).not.toBeInTheDocument()

    // input should no longer be focused
    expect(document.activeElement).not.toBe(input)
  })

  it('clears typed unmatched text and opens create modal when closed (click-out/scroll)', async () => {
    const onSelect = jest.fn()
    render(<CustomerDropdown id="c7" value={''} onSelect={onSelect} customers={customers} />)
    const input = screen.getByPlaceholderText(/select/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'DoesNotExist' } })

    // ensure no matches and add-new CTA is present
    expect(screen.getByText(/No customers match/i)).toBeInTheDocument()

    // Simulate closing via scrolling
    act(() => window.dispatchEvent(new Event('scroll')))

    // after close, input should be cleared
    expect((screen.getByPlaceholderText(/select/i) as HTMLInputElement).value).toBe('')

    // modal should be opened and prefilled with the previous search
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const name = dialog.querySelector<HTMLInputElement>('#name')
    expect(name?.value).toBe('DoesNotExist')
  })
})
