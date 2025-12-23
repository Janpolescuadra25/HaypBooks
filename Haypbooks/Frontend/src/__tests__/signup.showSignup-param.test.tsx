import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import SignupPage from '@/app/(public)/signup/page'

describe('Signup page showSignup behavior', () => {
  it('sets hasSeenIntro when showSignup=1 is present', async () => {
    // ensure clean
    localStorage.removeItem('hasSeenIntro')
    window.history.pushState({}, '', '/signup?showSignup=1')

    render(<SignupPage />)

    await waitFor(() => expect(localStorage.getItem('hasSeenIntro')).toBe('true'))
  })
})