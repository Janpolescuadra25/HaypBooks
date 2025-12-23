/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { act } from 'react'

jest.mock('@/services/auth.service', () => ({ authService: { signup: jest.fn(), isAuthenticated: jest.fn(() => false), getCurrentUser: jest.fn(), sendVerification: jest.fn() } }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import SignupPage from '@/app/(public)/signup/page'
import userEvent from '@testing-library/user-event'

describe('SignupPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()

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

    // stub window.location.assign/replace to avoid jsdom navigation errors when tests trigger location.href assignments
    const origLoc: any = window.location as any
    if (!origLoc.assign || typeof origLoc.assign !== 'function') origLoc.assign = jest.fn()
    if (!origLoc.replace || typeof origLoc.replace !== 'function') origLoc.replace = jest.fn()
  })

  afterEach(() => {
    // Restore console.error mock to original
    if ((console.error as any).mockRestore) (console.error as any).mockRestore()
  })

  test('shows role selection and both choices', () => {
    render(<SignupPage />)

    expect(screen.getByText(/which best describes your role\?/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /my business/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /accountant/i })).toBeTruthy()
  })

  test('selecting Accountant preserves role and includes it in signup payload', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.signup as jest.Mock).mockResolvedValue({ user: { id: 'u1', email: 'acct@b.com' } })

    render(<SignupPage />)

    // Choose accountant
    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })

    // form should appear now
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // grouped inside act to avoid react-hook-form async update warnings
    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'acct@b.com' } })
      // Firm name removed from the form by design; ensure we can sign up without it
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|create your account|start/i }))
    })

    await waitFor(() => expect(signupMock).toHaveBeenCalled())
    const callArgs = (signupMock as jest.Mock).mock.calls[0][0]
    expect(callArgs.role).toBe('accountant')
  })



  test('business signup allows missing Company name', async () => {
    const user = userEvent.setup()
    const signupMock = (require('@/services/auth.service').authService.signup as jest.Mock).mockResolvedValue({ user: { id: 'u2', email: 'biz@b.com' } })
    render(<SignupPage />)

    // Choose business
    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())

    // Leave company name out and attempt submit
    act(() => {
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } })
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@test.com' } })
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password1' } })
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1' } })
    })

    act(() => { fireEvent.click(screen.getByRole('button', { name: /create account|sign up|create your account|start/i })) })

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

    // Business role
    await act(async () => { await user.click(screen.getByRole('button', { name: /my business/i })) })
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeTruthy())
    expect(screen.queryByLabelText(/company name/i)).toBeNull()

    // Accountant role
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

    // Choose accountant and verify same subtext remains
    await act(async () => { await user.click(screen.getByRole('button', { name: /accountant/i })) })
    await waitFor(() => expect(screen.getByText(/Manage your accounting with clarity and confidence using HaypBooks\./i)).toBeInTheDocument())
  })
})