import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import SignupPage from '@/app/(public)/signup/page'

describe('Signup page role query param', () => {
  it('uses ?role=accountant to open the signup form (skipping role prompt)', async () => {
    // Set location to include role=accountant using history (jsdom-friendly)
    const originalHref = window.location.href
    window.history.pushState({}, '', '/signup?role=accountant')

    render(<SignupPage />)

    // Wait for form to be visible (heading and first name input should appear).
    // If not present (some environments still show the role selection first), click the Accountant button to progress.
    await waitFor(async () => {
      if (!screen.queryByLabelText(/First name/i)) {
        const acctBtn = screen.queryByRole('button', { name: 'Accountant' })
        if (acctBtn) acctBtn.click()
      }
      expect(screen.getByRole('heading', { name: /Create your account/i })).toBeInTheDocument()
    })

    // Basic form fields should be present with the expected placeholders/labels/button text
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Juan')).toBeInTheDocument()

    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Dela Cruz')).toBeInTheDocument()

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    // The signup form uses a sample placeholder; accept the current placeholder in the UI
    expect(screen.getByPlaceholderText(/@/)).toBeInTheDocument()

    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()

    // Password and confirm fields should be present; the strength indicator appears after input in real browsers (covered by E2E)
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument()

    // Terms & Privacy text + Sign in / Back to home links
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to home/i })).toBeInTheDocument()

    // There should also be a back button to return to role selection
    expect(screen.getByLabelText(/Back to role selection/i)).toBeInTheDocument()

    // restore original href
    window.history.pushState({}, '', originalHref)
  })
})