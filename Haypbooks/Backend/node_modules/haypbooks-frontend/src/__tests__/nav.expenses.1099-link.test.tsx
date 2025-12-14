import React from 'react'
import { render, screen } from '@testing-library/react'
import ExpensesNav from '@/components/ExpensesNav'

// Validate that the 1099 filings link appears and is active on its route
jest.mock('next/navigation', () => ({
  usePathname: () => '/1099-filings',
}))

describe('ExpensesNav 1099 filings link', () => {
  it('renders 1099 filings link and marks it active', () => {
    render(<ExpensesNav />)
    const link = screen.getByRole('link', { name: /1099 filings/i })
    expect(link).toBeInTheDocument()
    expect(link.className).toMatch(/btn-primary/)
  })
})
