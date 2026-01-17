import { render, screen, waitFor } from '@testing-library/react'
import HubSelectionPage from '@/app/hub/selection/page'
import * as profile from '@/lib/profile-cache'

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn() }))

describe('HubSelectionPage', () => {
  it('renders two hub cards and headings', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'Alex', companies: ['A','B','C'], practiceName: 'Rivera CPA', clients: [1,2,3] })
    render(<HubSelectionPage />)
    expect(await screen.findByText(/Choose how.*HaypBooks today/)).toBeInTheDocument()
    expect(screen.getByText(/My Companies/)).toBeInTheDocument()
    expect(screen.getByText(/My Practice/)).toBeInTheDocument()
  })

  it('fetches live counts and displays them', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'Demo User', companies: [], practiceName: 'Rivera CPA Services', clients: [] })

    // mock fetch responses
    (global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.includes('/api/companies')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1' }, { id: 'c2' }]) })
      }
      if (url.includes('/api/tenants/clients')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }, { id: 't5' }]) })
      }
      if (url.includes('/api/user/profile')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Demo User', companies: [], practiceName: 'Rivera CPA Services', clients: [] }) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<HubSelectionPage />)

    // Wait for updated counts from the mock fetch
    await waitFor(() => expect(screen.getByText(/2 active companies/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/5 active clients/i)).toBeInTheDocument())
  })
})