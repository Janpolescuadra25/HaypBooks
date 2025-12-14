import React from 'react'
import { render, screen } from '@testing-library/react'
import ExpensesNav from '@/components/ExpensesNav'

// Mock next/navigation to control pathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/bills/scheduled',
}))

describe('ExpensesNav nested active state', () => {
  it('highlights Bills for nested routes', () => {
    render(<ExpensesNav />)
    const link = screen.getByRole('link', { name: /bills/i })
    expect(link.className).toMatch(/btn-primary/)
  })
})
