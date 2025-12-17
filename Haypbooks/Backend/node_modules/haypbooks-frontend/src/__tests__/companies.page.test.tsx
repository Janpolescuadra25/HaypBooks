import React from 'react'
import { render, screen, waitFor } from '../test-utils'
import CompaniesPage from '../../app/companies/page'

describe('Companies page', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url) => {
      if (String(url).endsWith('/api/companies')) {
        return Promise.resolve({ json: () => Promise.resolve({ companies: [{ id: 'c1', name: 'Acme', status: 'ACTIVE' }] }) })
      }
      if (String(url).endsWith('/api/companies/invites')) {
        return Promise.resolve({ json: () => Promise.resolve({ invites: [] }) })
      }
      return Promise.resolve({ json: () => Promise.resolve({}) })
    })
  })

  it('renders companies list', async () => {
    render(<CompaniesPage />)
    expect(screen.getByText(/My Companies & Clients/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument())
  })
})
