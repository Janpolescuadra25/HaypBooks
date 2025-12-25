import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

jest.mock('@/services/auth.service', () => ({
  authService: {
    getCurrentUser: jest.fn()
  }
}))
import { authService } from '@/services/auth.service'
import VerificationPage from '@/app/verification/page'

describe('Verification page PIN behavior', () => {
  afterEach(() => { jest.clearAllMocks() })

  test('prompts to create a PIN when none exists after clicking Enter Your PIN', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    // The initial page should show the options selection (not auto-navigate to setup)
    expect(screen.getByText(/Enter Your PIN/i)).toBeInTheDocument()
    expect(screen.getByText(/Send Code to Email/i)).toBeInTheDocument()

    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()
    await act(async () => { await user.click(enterBtn) })

    expect(await screen.findByText(/Set Up Your PIN for Faster Login/i)).toBeInTheDocument()
  })

  test('initial view is options (not setup) even when server suggests setup', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', requiresPinSetup: true, hasPin: false })

    render(<VerificationPage />)
    // Should still show options first
    expect(screen.getByText(/Enter Your PIN/i)).toBeInTheDocument()
    expect(screen.getByText(/Send Code to Email/i)).toBeInTheDocument()
  } )

  test('shows PIN input when user already has a PIN', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: true })

    render(<VerificationPage />)
    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()
    await act(async () => { await user.click(enterBtn) })

    // Expect the first PIN input to be present
    expect(await screen.findByLabelText('Enter PIN digit 1')).toBeInTheDocument()
  })

  test('re-fetches user on Enter and reacts to changed server flag', async () => {
    // Initial mount returns hasPin=true, but on-click the server says hasPin=false
    const mk = authService.getCurrentUser as jest.Mock
    mk.mockResolvedValueOnce({ email: 'dev@example.com', hasPin: true })
    mk.mockResolvedValueOnce({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()
    await act(async () => { await user.click(enterBtn) })

    // Should navigate to setup after re-fetch showing hasPin=false
    expect(await screen.findByText(/Set Up Your PIN for Faster Login/i)).toBeInTheDocument()
  })
})
