import React from 'react'
import { render, screen } from '@testing-library/react'
import Page from '@/app/hub/companies/page'
import { act } from 'react'
describe('Owner Hub page', () => {
  beforeEach(() => {
    // Mock API fetch for companies so the component updates synchronously in tests
    global.fetch = jest.fn((url: string) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', name: 'Global Assets Ltd', plan: 'Enterprise Plan' },
          { id: '2', name: 'Hayp Creative Agency', plan: 'Pro Plan' },
          { id: '3', name: 'Northern Logistics', plan: 'Starter Plan' },
        ])
      } as any)
    }) as any
  })

  afterEach(() => {
    // @ts-ignore
    delete global.fetch
  })

  it('renders title, search, company cards, and register card', async () => {
    await act(async () => { render(<Page />) })

    // Search
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument()

    // Company names and plan badges (async)
    expect(await screen.findByText('Global Assets Ltd')).toBeInTheDocument()
    expect(await screen.findByText('Hayp Creative Agency')).toBeInTheDocument()
    expect(await screen.findByText('Northern Logistics')).toBeInTheDocument()
    expect((await screen.findAllByText('Enterprise Plan')).length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText('Pro Plan')).length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText('Starter Plan')).length).toBeGreaterThanOrEqual(1)

    // Dashboard CTAs and register card
    expect((await screen.findAllByText(/Open Dashboard/i)).length).toBeGreaterThanOrEqual(3)
    const registerLink = await screen.findByLabelText('Register entity')
    expect(registerLink).toHaveAttribute('role', 'button')
  })
})
