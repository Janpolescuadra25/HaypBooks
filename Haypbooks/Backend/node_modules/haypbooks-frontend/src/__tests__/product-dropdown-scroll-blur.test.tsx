import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductDropdown from '@/components/ProductDropdown'

// provide a minimal router mock
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('ProductDropdown scroll close & blur', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('closes and blurs the trigger when window scrolls', async () => {
    // mock fetch response used by ProductDropdown
    const rows = { rows: [ { name: 'Alpha' }, { name: 'Beta' } ] }
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => rows } as any)

    const onSelect = jest.fn()
    render(<ProductDropdown id="p1" value={''} onSelect={onSelect} />)

    const input = screen.getByPlaceholderText(/item…/i) as HTMLInputElement
    fireEvent.focus(input)

    // wait for options to appear
    await waitFor(() => expect(screen.getByRole('option', { name: /Alpha/i })).toBeInTheDocument())

    // dispatch window scroll and assert dropdown closed and trigger blurred
    fireEvent.scroll(window)

    await waitFor(() => expect(screen.queryByRole('option', { name: /Alpha/i })).not.toBeInTheDocument())

    expect(document.activeElement).not.toBe(input)
  })

  it('clears typed unmatched text & opens create modal on close', async () => {
    // no items returned from API
    const rows = { rows: [] }
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => rows } as any)

    const onSelect = jest.fn()
    render(<ProductDropdown id="p2" value={''} onSelect={onSelect} />)

    // focus and type a non-matching term
    const input = screen.getByPlaceholderText(/item…/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'NonExistent' } })

    // ensure no items message is shown
    await waitFor(() => expect(screen.getByText(/No items/i)).toBeInTheDocument())

    // close via scroll — dropdown should clear typed text and open modal
    act(() => window.dispatchEvent(new Event('scroll')))

    // input should be cleared
    expect((screen.getByPlaceholderText(/item…/i) as HTMLInputElement).value).toBe('')

    // modal should be present with the accessible dialog name and prefilled
    const dialog = await screen.findByRole('dialog', { name: /new product \/ service/i })
    expect(dialog).toBeInTheDocument()
    // verify overlay/backdrop and shadow styling are applied (matching discard modal), overlay visible
    const overlay = document.querySelector('[data-testid="create-product-overlay"]') as HTMLElement
    expect(overlay).toBeInTheDocument()
    await waitFor(() => expect(overlay.className).toEqual(expect.stringContaining('opacity-100')))
    expect(dialog.className).toEqual(expect.stringContaining('shadow-['))
    const name = dialog.querySelector<HTMLInputElement>('#p-name')
    expect(name?.value).toBe('NonExistent')

    // stub create API and check that clicking save calls onSelect with created product name
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'p-new', name: 'NonExistent' }) } as any)
    const save = screen.getByRole('button', { name: /save/i })
    fireEvent.click(save)
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('NonExistent'))
  })
})
