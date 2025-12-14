import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActionsClient from '@/app/sales/statements/[id]/ActionsClient'

describe('ActionsClient — message selection and send', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  test('loads library and sends selected messageId in POST body', async () => {
    // mock fetch responses: first call to /api/messages -> library, second call to /statement/send -> queued response
    const fetchMock = jest.fn(async (input: any, init?: any) => {
      const url = (typeof input === 'string') ? input : String(input?.url || '')
      if (url.includes('/api/messages') && (!init || init.method === 'GET')) {
        return { ok: true, json: async () => ({ messages: [{ id: 'm1', name: 'Greet', body: 'Hi' }] }) }
      }
      if (url.includes('/statement/send') && init && init.method === 'POST') {
        // capture posted body
        const posted = init.body ? JSON.parse(init.body) : {}
        // echo posted values inside result so ActionsClient can show queued id
        return { ok: true, json: async () => ({ result: { messageId: posted.messageId || 'queued-noid' } }) }
      }
      return { ok: false }
    })
    global.fetch = fetchMock as any

    render(<ActionsClient customerId="c1" asOfIso="2025-10-01" canSend={true} />)

    // Wait for library dropdown to populate (and the option to be present)
    await waitFor(() => expect(screen.getByRole('option', { name: /Greet/i })).toBeInTheDocument())
    // select library message and wait for the state to update
    const select = screen.getByLabelText(/Select message/i) as HTMLSelectElement
    await act(async () => { await userEvent.selectOptions(select, 'm1') })
    await waitFor(() => expect(select.value).toBe('m1'))

    const sendBtn = screen.getByRole('button', { name: /Send/i })
      await act(async () => { await userEvent.click(sendBtn) })

    // wait for the POST to be issued to the send endpoint
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    // ensure fetch was called for POST and payload contains messageId
      const postCall = fetchMock.mock.calls.find(c => c[1] && c[1].method === 'POST')
    expect(postCall).toBeTruthy()
    const body = postCall ? postCall[1].body : undefined
    expect(body).toBeDefined()
    const parsed = JSON.parse(body)
    expect(parsed).toHaveProperty('messageId', 'm1')
  })

  test('sends custom messageOverride when custom selected', async () => {
    const fetchMock = jest.fn(async (input: any, init?: any) => {
      const url = (typeof input === 'string') ? input : String(input?.url || '')
      if (url.includes('/api/messages') && (!init || init.method === 'GET')) {
        return { ok: true, json: async () => ({ messages: [{ id: 'm1', name: 'Greet', body: 'Hi' }] }) }
      }
      if (url.includes('/statement/send') && init && init.method === 'POST') {
        const posted = init.body ? JSON.parse(init.body) : {}
        return { ok: true, json: async () => ({ result: { messageId: posted.messageId || 'queued-noid' } }) }
      }
      return { ok: false }
    })
    global.fetch = fetchMock as any

    render(<ActionsClient customerId="c2" asOfIso="2025-11-01" canSend={true} />)
    await waitFor(() => expect(screen.getByLabelText(/Select message/i)).toBeInTheDocument())

    const select = screen.getByLabelText(/Select message/i) as HTMLSelectElement
    // choose custom
    fireEvent.change(select, { target: { value: '__custom__' } })
    // wait for textarea to appear, then set value
    const ta = await waitFor(() => screen.getByLabelText(/Custom message override/i) as HTMLTextAreaElement)
    fireEvent.change(ta, { target: { value: 'Please pay ASAP' } })
    await waitFor(() => expect(ta.value).toBe('Please pay ASAP'))

    const sendBtn = screen.getByRole('button', { name: /Send/i })
      await act(async () => { await userEvent.click(sendBtn) })

    // wait for the POST to be issued to the send endpoint
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
      const postCall = fetchMock.mock.calls.find(c => c[1] && c[1].method === 'POST')
    const body = postCall ? postCall[1].body : undefined
    expect(body).toBeDefined()
    const parsed = JSON.parse(body)
    expect(parsed).toHaveProperty('messageOverride', 'Please pay ASAP')
  })
})
