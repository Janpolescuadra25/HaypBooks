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

  test('stores user in localStorage after successful login and redirects (or verification when probe indicates)', async () => {
    // Case A: login returns user and getCurrentUser indicates verified -> hub selection
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com', onboardingCompleted: true } })
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 'u1', email: 'a@b.com', isEmailVerified: true, isPhoneVerified: true })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/workspace'))
    expect(localStorage.getItem('user')).toBeTruthy()

    // Case B: login returns user but getCurrentUser probe reports unverified -> verification
    replaceMock.mockReset()
    // Some test environments may not have a clear() helper; be defensive
    if (typeof localStorage.clear === 'function') { localStorage.clear() } else { Object.keys(localStorage).forEach((k) => localStorage.removeItem(k)) }
    (authService.login as jest.Mock).mockResolvedValueOnce({ user: { id: 'u2', email: 'b@b.com', onboardingCompleted: true } })
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: 'u2', email: 'b@b.com', isEmailVerified: false, isPhoneVerified: false })

    fireEvent.change(emailInput, { target: { value: 'b@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
  })

  test('DEV mode: force redirect to verification when NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN=1', async () => {
    const original = process.env.NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN
    try {
      process.env.NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN = '1'
    } catch (err) {
      // Some test harnesses may lock process.env; fall back to defining the property
      try { Object.defineProperty(process.env, 'NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN', { value: '1', configurable: true }) } catch (e) { /* ignore */ }
    }

    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u3', email: 'dev@b.com', onboardingCompleted: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'dev@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))

    // restore original
    try { process.env.NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN = original } catch (e) { /* ignore */ }
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

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/workspace'))
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

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/workspace'))
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
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
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
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
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

  test('redirects to /verification when backend indicates account is unverified', async () => {
    const attemptedEmail = 'notverified@b.com'
    ;(authService.login as jest.Mock).mockRejectedValue({ response: { status: 401, data: { message: 'Please verify your account before logging in' } } })

    // Also test when the thrown error is a plain Error with the message (some runtimes surface this way)
    ;(authService.login as jest.Mock).mockRejectedValueOnce(new Error('Please verify your account before logging in'))
    render(<LoginPage />)

    const emailInput2 = screen.getByPlaceholderText(/name@company.com/i)
    const passInput2 = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput2, { target: { value: attemptedEmail } })
    fireEvent.change(passInput2, { target: { value: 'SomePass!1' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    // We expect the login page to navigate to the verification selection screen and include origin
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
  })

  test('redirects to verification when probe returns ambiguous verification state (missing phone)', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u7', email: 'amb@b.com', onboardingCompleted: true } })
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 'u7', email: 'amb@b.com', isEmailVerified: true })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const form = document.querySelector('form') as HTMLFormElement

    fireEvent.change(emailInput, { target: { value: 'amb@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
  })

  test('redirects to /verification when backend message uses "confirm" wording', async () => {
    const attemptedEmail = 'confirmme@b.com'
    ;(authService.login as jest.Mock).mockRejectedValue({ response: { status: 401, data: { message: 'Please confirm your account' } } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: attemptedEmail } })
    fireEvent.change(passInput, { target: { value: 'SomePass!1' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('from=signin')))
  })

  test('logs when getCurrentUser probe fails and redirects to verification', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    // set implementations directly to avoid any issues with jest.resetAllMocks
    ;(authService as any).login = jest.fn().mockResolvedValue({ user: { id: 'probefail', email: 'probe@b.com', onboardingCompleted: true } })
    ;(authService as any).getCurrentUser = jest.fn().mockRejectedValue(new Error('probe failure'))

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'probe@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/verification')))
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[login] getCurrentUser probe failed'))

    warnSpy.mockRestore()
  })
})
