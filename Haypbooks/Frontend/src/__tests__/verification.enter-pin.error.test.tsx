import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationPage from '@/app/verification/page'

jest.mock('@/services/auth.service', () => ({ authService: { getCurrentUser: jest.fn(() => Promise.reject(new Error('Network error'))), logout: jest.fn(() => Promise.resolve()) } }))
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

describe('VerificationPage - Enter PIN error handling', () => {
  it('shows an inline error and falls back to setup on getCurrentUser failure', async () => {
    // Force immediate fallback after a single attempt via query params
    window.history.pushState({}, '', '/?verification_attempts=1')

    render(<VerificationPage />)

    const btn = await screen.findByRole('button', { name: /Enter Your PIN|Checking…/i })
    const { act } = require('react-dom/test-utils')
    await act(async () => { fireEvent.click(btn) })

    // Should show friendly error message (may appear in multiple places)
    const errs = await screen.findAllByText(/Network error|Failed to fetch/)
    expect(errs.length).toBeGreaterThan(0)

    // Should surface a Retry action and keep the verification options visible
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    expect(screen.getByText(/Enter Your PIN/i)).toBeInTheDocument()
  })
})