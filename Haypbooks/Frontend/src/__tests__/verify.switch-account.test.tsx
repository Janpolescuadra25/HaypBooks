import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationPage from '@/app/verification/page'

jest.mock('@/services/auth.service', () => ({ authService: { logout: jest.fn(() => Promise.resolve()), getCurrentUser: jest.fn(() => Promise.resolve({ id: 'u1', email: 'switchme@haypbooks.test' })) } }))

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

describe('VerificationPage - Switch Account', () => {
  it('calls logout and navigates to login with email when Switch Account clicked', async () => {
    const auth = require('@/services/auth.service')
    auth.authService.logout.mockClear()

    // Simulate a short async delay to observe loading state
    auth.authService.logout.mockImplementation(() => new Promise((res) => setTimeout(res, 50)))

    jest.useFakeTimers()

    render(<VerificationPage />)

    // Wait for the initial getCurrentUser() call to resolve so userEmail is set
    await waitFor(() => expect(require('@/services/auth.service').authService.getCurrentUser).toHaveBeenCalled())

    const btn = await screen.findByRole('button', { name: /Switch account|Signing out...|Not you\? Switch account/i })
    const { act } = require('react-dom/test-utils')
    await act(async () => {
      fireEvent.click(btn)

      // Fast-forward the logout promise and any pause
      jest.advanceTimersByTime(600)

      // Let pending promise microtasks flush
      await Promise.resolve()
    })

    await waitFor(() => expect(auth.authService.logout).toHaveBeenCalled())
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login?email=switchme%40haypbooks.test&loggedOut=1'))

    jest.useRealTimers()
  })
})