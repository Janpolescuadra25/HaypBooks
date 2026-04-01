import React from 'react'
import { render, screen } from '@testing-library/react'
import HubSidebar from '@/components/HubSidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/hub/companies' }))

describe('HubSidebar', () => {
  it('renders links and highlights Companies as active', () => {
    render(<HubSidebar />)
    expect(screen.getByText('Companies')).toBeInTheDocument()
    const companiesLink = screen.getByRole('link', { name: /companies/i })
    expect(companiesLink).toHaveClass('active')
  })
})
