import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'
import React from 'react'

jest.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }))

describe('Sidebar navigation', () => {
  it('renders Dashboard link in left nav', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /Dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('/dashboard')
  })
})
