import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from '@/app/bank-transactions/rules/page'
import { withinAct, flushAsync } from '../test-utils/act-helpers'

jest.mock('next/navigation', () => ({ usePathname: () => '/bank-transactions/rules' }))

describe('Bank Rules UI', () => {
  const originalFetch = global.fetch as any
  const originalAlert = global.alert as any
  const originalConfirm = (global as any).confirm

  afterEach(() => {
    global.fetch = originalFetch
    // @ts-ignore
    global.alert = originalAlert
    // @ts-ignore
    global.confirm = originalConfirm
  })

  it('renders rules header, form, and Apply button', async () => {
    // Basic fetch stub: initial list empty
    global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = typeof url === 'string' ? url : url.toString()
      if (u.includes('/api/bank-feeds/rules') && (!init || (init.method || 'GET').toUpperCase() === 'GET')) {
        return new Response(JSON.stringify({ rules: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      }
      if (u.includes('/api/bank-feeds/apply-rules') && init?.method === 'POST') {
        return new Response(JSON.stringify({ updated: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
    }) as any

  render(<Page />)
  expect(await screen.findByText(/^Rules$/i)).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /apply rules/i })[0]).toBeInTheDocument()
  expect(screen.getByLabelText(/Print/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument()
  })

  it('loads, validates, creates, deletes, and applies rules', async () => {
    // Mock alert/confirm
    // @ts-ignore
    global.alert = jest.fn()
    // @ts-ignore
    global.confirm = jest.fn(() => true)

    // Stateful fetch mock
    const state: { rules: any[] } = {
      rules: [
        { id: 'r1', name: 'ONLINE deposits', textIncludes: 'ONLINE', setCategory: 'Income' },
      ],
    }
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase()
      if (url.startsWith('/api/bank-feeds/rules')) {
        if (method === 'GET') return { ok: true, json: async () => ({ rules: state.rules.slice() }) } as any
        if (method === 'POST') {
          const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : (init?.body as any)
          const next = { id: `r_${Math.random().toString(36).slice(2, 6)}`, ...body }
          state.rules.push(next)
          return { ok: true, status: 201, json: async () => ({ rule: next }) } as any
        }
        if (method === 'DELETE') {
          const id = new URL(url, 'http://localhost').searchParams.get('id')
          state.rules = state.rules.filter((r) => r.id !== id)
          return { ok: true, json: async () => ({ ok: true }) } as any
        }
      }
      if (url.startsWith('/api/bank-feeds/apply-rules')) {
        return { ok: true, json: async () => ({ updated: 3 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)

    const user = userEvent.setup()
    render(<Page />)

    // Loads existing rules
    await waitFor(() => expect(screen.getByText(/Bank rules/i)).toBeInTheDocument())
    // Wait for initial data render (list replaces Loading…)
    await screen.findByText(/ONLINE deposits/i)

    // Validation: name required and amount numeric
    const addBtn = screen.getByRole('button', { name: /Add rule/i })
    expect(addBtn).toBeDisabled()
    const nameInput = screen.getByLabelText(/Name/i)
    await withinAct(() => user.type(nameInput, 'Exactly $5'))
    const amtInput = screen.getByLabelText(/Amount equals/i)
    await withinAct(() => user.type(amtInput, 'abc'))
    expect(addBtn).toBeDisabled()
    // Fix amount
    await withinAct(() => user.clear(amtInput))
    await withinAct(() => user.type(amtInput, '5'))
    await flushAsync()
    expect(addBtn).toBeEnabled()

    // Create
    await withinAct(() => user.click(addBtn))
    await waitFor(() => {
      expect(screen.getByText(/Exactly \$5/i)).toBeInTheDocument()
    })

    // Delete newly created rule
    const row = screen.getByText(/Exactly \$5/i).closest('tr')!
    const delBtn = within(row).getByRole('button', { name: /Delete/i })
    await withinAct(() => user.click(delBtn))
    // confirm() is called; auto-accept in jsdom (default true). If needed, stub: global.confirm = jest.fn(() => true)
    await waitFor(() => {
      expect(screen.queryByText(/Exactly \$5/i)).not.toBeInTheDocument()
    })

    // Apply rules triggers alert with count
  const applyBtn = screen.getAllByRole('button', { name: /Apply rules/i })[0]
    await withinAct(() => user.click(applyBtn))
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled()
    })
  })
})
