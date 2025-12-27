import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HubSelectionPage from '@/app/hub/selection/page'

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn() }))

jest.mock('@/services/auth.service', () => ({ authService: { logout: jest.fn(() => Promise.resolve()) } }))

jest.mock('@/components/ToastProvider', () => {
  const push = jest.fn()
  return { useToast: () => ({ push }), __push: push }
})

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

describe('HubSelectionPage - Switch Account', () => {
  it('calls logout and navigates to login when Switch Account clicked', async () => {
    const profile = require('@/lib/profile-cache')
    profile.getProfileCached.mockResolvedValue({ name: 'Alex', companies: [], practiceName: 'Rivera', clients: [1] })

    const auth = require('@/services/auth.service')
    auth.authService.logout.mockClear()
    const toast = require('@/components/ToastProvider')

    // Simulate async logout with a short delay so we can assert the delay + toast behavior
    auth.authService.logout.mockImplementation(() => new Promise((res) => setTimeout(res, 50)))

    jest.useFakeTimers()
    render(<HubSelectionPage />)

    const btn = await screen.findByRole('button', { name: /Switch Account|Signing out.../i })
    fireEvent.click(btn)

    // Button should show loading state
    await waitFor(() => expect(btn).toHaveTextContent(/Signing out.../i))

    // Fast-forward the logout promise and the added pause
    jest.advanceTimersByTime(600)

    // Let pending promise microtasks flush
    await Promise.resolve()

    await waitFor(() => expect(auth.authService.logout).toHaveBeenCalled())
    await waitFor(() => expect(toast.__push).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' })))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login'))

    jest.useRealTimers()
  })
})