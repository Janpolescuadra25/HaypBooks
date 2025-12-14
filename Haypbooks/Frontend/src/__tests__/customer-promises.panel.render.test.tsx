import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

describe('Customer Promises Panel — render and actions (mocked)', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    const promises = [
      { id: 'p1', customerId: 'c1', amount: 100, promisedDate: '2025-10-20', status: 'open', createdAt: '2025-10-10' },
      { id: 'p2', customerId: 'c1', amount: 50, promisedDate: '2025-10-01', status: 'broken', createdAt: '2025-10-02' },
    ]
    ;(global as any).fetch = jest.fn((url: string, init?: any) => {
      if (typeof url === 'string' && url.startsWith('/api/collections/promises?')) {
        return Promise.resolve(new Response(JSON.stringify({ promises }), { status: 200 }))
      }
      if (typeof url === 'string' && url === '/api/collections/promises' && init?.method === 'POST') {
        promises.push({ id: 'p3', customerId: 'c1', amount: 75, promisedDate: '2025-10-25', status: 'open', createdAt: '2025-10-11' }) as any
        return Promise.resolve(new Response(JSON.stringify({ promise: promises[promises.length-1] }), { status: 200 }))
      }
      if (typeof url === 'string' && url.startsWith('/api/collections/promises/') && init?.method === 'POST') {
        const id = url.split('/')[4]
        const act = url.split('/')[5]
        const p = promises.find(x => x.id === id)
        if (p) p.status = act === 'keep' ? 'kept' : 'broken'
        return Promise.resolve(new Response(JSON.stringify({ promise: p }), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.clearAllMocks()
  })

  test('lists promises and supports create/mark actions', async () => {
    const Panel = (await import('@/app/customers/[id]/promises-client')).default as any
    render(<Panel customerId="c1" />)

    // Panel header present
    expect(await screen.findByText('Promises to pay')).toBeInTheDocument()
    // Existing rows present
    expect(await screen.findByText('2025-10-20')).toBeInTheDocument()
    expect(await screen.findByText('2025-10-01')).toBeInTheDocument()
    expect(await screen.findByText('Broken')).toBeInTheDocument()

    // Create new promise
    const amt = await screen.findByLabelText('Amount') as HTMLInputElement
    fireEvent.change(amt, { target: { value: '75' } })
    const date = screen.getByLabelText('Promised date') as HTMLInputElement
    fireEvent.change(date, { target: { value: '2025-10-25' } })
    const submit = screen.getByRole('button', { name: /Create promise/i })
    fireEvent.click(submit)
    await waitFor(() => expect(screen.getByText('2025-10-25')).toBeInTheDocument())

    // Mark kept action
    const keepBtn = screen.getAllByRole('button', { name: /Mark kept/i })[0]
    fireEvent.click(keepBtn)
    await waitFor(() => expect(screen.getByText('Kept')).toBeInTheDocument())
  })
})
