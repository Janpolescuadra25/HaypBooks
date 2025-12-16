import React from 'react'
import { render, screen } from '@testing-library/react'
import SignupPage from '@/app/(public)/signup/page'

describe('Signup page role param handling', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads role query param and shows banner', () => {
    // simulate URL with ?role=accountant
    const url = 'http://localhost:3000/auth/signup?role=accountant'
    window.history.pushState({}, 'Test', url)

    render(<SignupPage />)

    const banner = screen.getByText(/Signing up as/i)
    expect(banner).toBeInTheDocument()
    expect(localStorage.getItem('preferred_role')).toBe('accountant')
  })
})
