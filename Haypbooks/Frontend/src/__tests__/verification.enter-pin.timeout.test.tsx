import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationPage from '@/app/verification/page'

jest.mock('@/services/auth.service', () => ({ authService: { getCurrentUser: jest.fn(() => new Promise(() => {})), logout: jest.fn(() => Promise.resolve()) } }))
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

describe('VerificationPage - Enter PIN timeout fallback', () => {
  it('shows timeout error and falls back to setup when request hangs', async () => {
    jest.useFakeTimers()
    // Use query params to override timeouts/attempts for test stability
    window.history.pushState({}, '', '/?verification_timeout=1000&verification_attempts=1')

    render(<VerificationPage />)

    const btn = await screen.findByRole('button', { name: /Enter Your PIN|Checking…/i })
    fireEvent.click(btn)

    // advance the timeout to trigger fallback inside act
    const { act } = require('react-dom/test-utils')
    await act(async () => {
      jest.advanceTimersByTime(1500)
      // allow pending microtasks to run
      await Promise.resolve()
    })

    const msgs = await screen.findAllByText(/Request timed out/i)
    expect(msgs.length).toBeGreaterThan(0)
    // Ensure retry action is available and options remain
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    expect(screen.getByText(/Enter Your PIN/i)).toBeInTheDocument()
    jest.useRealTimers()
  })
})