/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'

jest.mock('@/services/auth.service', () => ({ authService: { login: jest.fn(), isAuthenticated: jest.fn(() => false), getCurrentUser: jest.fn() } }))
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import LoginPage from '@/app/(public)/login/page'
import { authService } from '@/services/auth.service'

// Stub HubSelectionModal for unit tests
jest.mock('@/components/HubSelectionModal', () => ({ __esModule: true, default: (props: any) => <div data-testid="hub-modal">Hub Modal</div> }))

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
  })

  test('shows invalid credentials message on 401 (not timeout)', async () => {
    ;(authService.login as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { code: 'invalid_credentials' } },
    })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'bad@b.com' } })
    fireEvent.change(passInput, { target: { value: 'WrongPass!' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/request timed out/i)).not.toBeInTheDocument()
  })

  test('stores user in localStorage after successful login and redirects', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com', onboardingCompleted: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/hub/selection'))
    expect(localStorage.getItem('user')).toBeTruthy()
  })

  test('redirects to /accountant when server suggests it', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u2', email: 'acct@b.com', onboardingCompleted: true }, redirect: '/hub/accountant' })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'acct@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/hub/selection'))
    // ensure the login was called
    expect(authService.login).toHaveBeenCalled()
  })

  test('redirects to hub selection page when server requests hub selection', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u3', email: 'both@b.com', onboardingCompleted: true, requiresHubSelection: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'both@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/hub/selection'))
    expect(authService.login).toHaveBeenCalled()
  })

  test('redirects to /verification when server requests additional verification', async () => {
    // Simulate server asking for verification via mfaRequired flag
    (authService.login as jest.Mock).mockResolvedValue({ mfaRequired: true, user: { id: 'u4', email: 'pinless@b.com', onboardingCompleted: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'pinless@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    expect(authService.login).toHaveBeenCalled()
  })

  test('redirects to /verification when server returns mfaRequired flag (dev)', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ mfaRequired: true, user: { id: 'u6', email: 'mfa@b.com', onboardingCompleted: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'mfa@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    expect(authService.login).toHaveBeenCalled()
  })

  test('does not auto-redirect on mount when ?showLogin=1 even if authenticated', async () => {
    // Simulate existing session but user intentionally requested login form
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 'u5', email: 'x@y.com' })

    // Ensure previous router mock calls are cleared
    replaceMock.mockReset()

    // set location search to include showLogin=1 using history push so jsdom doesn't navigate
    window.history.pushState({}, '', '/login?showLogin=1')

    render(<LoginPage />)

    // give effects a tick
    await new Promise((r) => setTimeout(r, 10))

    // ensure we did not redirect away
    expect(replaceMock).not.toHaveBeenCalled()
  })

  test('shows resend verification UI when backend indicates account is unverified', async () => {
    const attemptedEmail = 'notverified@b.com'
    ;(authService.login as jest.Mock).mockRejectedValue({ response: { status: 401, data: { message: 'Please verify your account before logging in' } } })
    ;(authService as any).sendVerification = jest.fn().mockResolvedValue({ otp: '222222' })

    // Also test when the thrown error is a plain Error with the message (some runtimes surface this way)
    ;(authService.login as jest.Mock).mockRejectedValueOnce(new Error('Please verify your account before logging in'))
    render(<LoginPage />)

    const emailInput2 = screen.getByPlaceholderText(/name@company.com/i)
    const passInput2 = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput2, { target: { value: attemptedEmail } })
    fireEvent.change(passInput2, { target: { value: 'SomePass!1' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    // Wait for the unverified UI to show for this error shape too
    await waitFor(() => expect(screen.getByText(/Account not verified/i)).toBeInTheDocument())

    // Unmount the previous render before re-rendering to avoid duplicated DOM nodes
    cleanup()
    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: attemptedEmail } })
    fireEvent.change(passInput, { target: { value: 'SomePass!1' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    // Wait for the unverified UI to show
    await waitFor(() => expect(screen.getByText(/Account not verified/i)).toBeInTheDocument())

    const resendBtn = screen.getByRole('button', { name: /Resend verification/i })
    fireEvent.click(resendBtn)

    await waitFor(() => expect((authService as any).sendVerification).toHaveBeenCalledWith(attemptedEmail))
    // And the dev OTP info should be shown in the UI
    await waitFor(() => expect(screen.getByText(/Dev code: 222222/i)).toBeInTheDocument())
  })
})
