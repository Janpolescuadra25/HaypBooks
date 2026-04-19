import React from 'react'
import { render, screen } from '@testing-library/react'
import HubSidebar from '@/components/HubSidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/hub/billing' }))

describe('HubSidebar', () => {
  it('renders links and highlights Billing Management as active', () => {
    render(<HubSidebar />)
    expect(screen.getByText('Billing Management')).toBeInTheDocument()
    const billingLink = screen.getByRole('link', { name: /billing management/i })
    expect(billingLink).toHaveClass('active')
  })
})
