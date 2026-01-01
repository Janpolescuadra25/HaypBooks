/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { act } from 'react'

jest.mock('@/services/auth.service', () => ({ authService: { preSignup: jest.fn(), completeSignup: jest.fn(), isAuthenticated: jest.fn(() => false), getCurrentUser: jest.fn(), sendVerification: jest.fn() } }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import SignupPage from '@/app/(public)/signup/page'
import userEvent from '@testing-library/user-event'

describe('SignupPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()

    // reset history/search so tests don't pick up query params from other suites
    window.history.pushState({}, '', '/')

    const origError = console.error
    jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      const m = args[0]
      if (typeof m === 'string') {
        // ignore styled-jsx non-boolean attribute warning in tests
        if (m.includes('non-boolean attribute `jsx`')) return
        // ignore act() warnings for this suite which are noisy from react-hook-form internals
        if (m.includes('not wrapped in act') || m.includes('React act() warning intercepted')) return
        // ignore jsdom navigation not implemented message
        if (m.includes('Not implemented: navigation')) return
      }
      origError(...args)
    })

    // stub window.location.assign/replace/href to avoid jsdom navigation errors when tests trigger location.href assignments
    const origLoc: any = window.location as any
    if (!origLoc.assign || typeof origLoc.assign !== 'function') origLoc.assign = jest.fn()
    if (!origLoc.replace || typeof origLoc.replace !== 'function') origLoc.replace = jest.fn()
    try { Object.defineProperty(window, 'location', { value: { ...origLoc, assign: origLoc.assign, replace: origLoc.replace, href: '' }, writable: true }) } catch (e) {}
  })

  afterEach(() => {
    // Restore console.error mock to original
    if ((console.error as any).mockRestore) (console.error as any).mockRestore()
  })

  test('shows role selection and both choices', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Ensure role selection is visible (page may sometimes mount in form view in tests)
    if (!screen.queryByText(/which best describes your role\?/i)) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.getByText(/which best describes your role\?/i)).toBeTruthy())
    }

    expect(screen.getByRole('button', { name: /my business/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /accountant/i })).toBeTruthy()
  })

  test('selecting Accountant preserves role and includes it in signup payload', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.preSignup as jest.Mock).mockResolvedValue({ signupToken: 'token1', otp: '123456' })

    render(<SignupPage />)

    // Ensure we're on role selection, otherwise go back to it
    if (!screen.queryByRole('button', { name: /accountant/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /accountant/i })).toBeTruthy())
    }

    // Choose accountant
    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })

    // form should appear now
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // grouped inside act to avoid react-hook-form async update warnings
    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'acct@b.com' } })
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+63 912 345 6789' } })
      // Firm name removed from the form by design; ensure we can sign up without it
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    const submitBtn = screen.getByRole('button', { name: /create account|sign up|create your account|start/i })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    act(() => { fireEvent.click(submitBtn) })

    await waitFor(() => expect(signupMock).toHaveBeenCalled())
    const callArgs = (signupMock as jest.Mock).mock.calls[0][0]
    expect(callArgs.role).toBe('accountant')
  })



  test('business signup allows missing Company name', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.preSignup as jest.Mock).mockResolvedValue({ signupToken: 'token2', otp: '123456' })
    render(<SignupPage />)

    // Ensure role selection visible and choose business
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // Leave company name out and attempt submit
    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } })
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@test.com' } })
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+63 912 345 6789' } })
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    const submitBtn = screen.getByRole('button', { name: /create account|sign up|create your account|start/i })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    act(() => { fireEvent.click(submitBtn) })

    await waitFor(() => expect(signupMock).toHaveBeenCalled())
  })

  test('back button returns to role selection from form', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Choose accountant to enter the form
    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // Back button should be present (test by testid for robustness)
    const backBtn = screen.getByTestId('signup-back-to-role')
    expect(backBtn).toBeTruthy()

    // Click back and assert we're back to role selection
    await act(async () => { await user.click(backBtn) })
    await waitFor(() => expect(screen.getByText(/which best describes your role\?/i)).toBeTruthy())
  })

  test('signup form does not render a company or firm name input', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Ensure role selection visible and choose business
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())
    expect(screen.queryByLabelText(/company name/i)).toBeNull()

    // Accountant role (go back to selection if needed)
    if (!screen.queryByRole('button', { name: /accountant/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /accountant/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())
    expect(screen.queryByLabelText(/firm name/i)).toBeNull()
  })

  test('shows neutral headline subtext for both roles', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Default (role selection screen) should show neutral subtext
    expect(screen.getByText(/Manage your accounting with clarity and confidence using HaypBooks\./i)).toBeInTheDocument()

    // Choose business and verify same subtext remains
    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByText(/Manage your accounting with clarity and confidence using HaypBooks\./i)).toBeInTheDocument())

    // Return to role selection and choose accountant then verify same subtext remains
    const backBtn = screen.getByTestId('signup-back-to-role')
    await act(async () => { await user.click(backBtn) })
    await waitFor(() => expect(screen.getByRole('button', { name: /accountant/i })).toBeTruthy())
    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })
    await waitFor(() => expect(screen.getByText(/Manage your accounting with clarity and confidence using HaypBooks\./i)).toBeInTheDocument())
  })

  test('includes phone in signup payload when provided', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.preSignup as jest.Mock).mockResolvedValue({ signupToken: 'token3', otp: '123456' })

    render(<SignupPage />)

    // Ensure role selection visible and choose business
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Phone' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Tester' } })
      fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'p@b.com' } })
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+63 912 345 6789' } })
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    const submitBtn = screen.getByRole('button', { name: /create account|sign up|create your account|start/i })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    act(() => { fireEvent.click(submitBtn) })

    await waitFor(() => expect(signupMock).toHaveBeenCalled())
    const called = (signupMock as jest.Mock).mock.calls[0][0]
    // phone is normalized to E.164 by the frontend util before submit
    expect(called.phone).toBe('+639123456789')
  })

  test('shows validation error and prevents signup when phone missing', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.preSignup as jest.Mock).mockResolvedValue({ signupToken: 'token4', otp: '123456' })

    render(<SignupPage />)

    // go to form
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'No' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Phone' } })
      fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'no-phone@b.com' } })
      // intentionally DO set an invalid phone here
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: 'abc123' } })
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    const submitBtn = screen.getByRole('button', { name: /create account|sign up|create your account|start/i })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    act(() => { fireEvent.click(submitBtn) })

    // ensure validation error renders (from normalize) and signup not called
    await waitFor(() => expect(screen.getByText(/Please provide a valid phone number/i)).toBeInTheDocument())
    expect(signupMock).not.toHaveBeenCalled()
  })

  test('long email does not show a "Show full" control and input contains full value', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // go to form
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeTruthy())

    const longEmail = 'janpolescuadra12341234@gmail.com'
    await act(async () => { await user.type(screen.getByPlaceholderText(/name@company.com/i), longEmail) })

    // No 'Show full' control should be present
    expect(screen.queryByRole('button', { name: /show full/i })).toBeNull()

    // Input element should still contain the full email value
    expect((screen.getByPlaceholderText(/name@company.com/i) as HTMLInputElement).value).toBe(longEmail)
  })

  test('Create account button disabled until passwords match and meet rules', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // go to form
    if (!screen.queryByRole('button', { name: /my business/i })) {
      const backBtn = screen.getByTestId('signup-back-to-role')
      await act(async () => { await user.click(backBtn) })
      await waitFor(() => expect(screen.queryByRole('button', { name: /my business/i })).toBeTruthy())
    }

    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // fill required fields but leave confirm mismatched
    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Match' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Test' } })
      fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'm@t.com' } })
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+63 912 345 6789' } })
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Mismatch' } })
    })

    // button should be disabled
    expect(screen.getByRole('button', { name: /create account|sign up|create your account|start/i })).toBeDisabled()

    // fix confirm and the button should become enabled
    act(() => { fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } }) })
    await waitFor(() => expect(screen.getByRole('button', { name: /create account|sign up|create your account|start/i })).toBeEnabled())
  })
})