import React from 'react'
import { render, screen } from '@testing-library/react'
import Page from '@/app/hub/companies/page'

describe('Owner Hub page', () => {
  it('renders title, search, company cards, and register card', () => {
    render(<Page />)

    // Title and search
    expect(screen.getByRole('heading', { name: /Your Business Portfolio/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument()

    // Company names and plan badges
    expect(screen.getByText('Global Assets Ltd')).toBeInTheDocument()
    expect(screen.getByText('Hayp Creative Agency')).toBeInTheDocument()
    expect(screen.getByText('Northern Logistics')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    expect(screen.getByText('Starter Plan')).toBeInTheDocument()

    // Dashboard CTAs and register card
    expect(screen.getAllByText(/Open Dashboard/i).length).toBeGreaterThanOrEqual(3)
    const registerLink = screen.getByLabelText('Register company')
    expect(registerLink).toHaveAttribute('href', '/companies/new')
  })
})
