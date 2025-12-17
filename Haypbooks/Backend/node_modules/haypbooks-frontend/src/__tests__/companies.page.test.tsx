import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CompanyList from '../components/companies/CompanyList'

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
    render(<CompanyList companies={[{ id: 'c1', name: 'Acme', status: 'ACTIVE' }]} />)
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument())
  })
})
