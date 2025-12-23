/** @jest-environment jsdom */
import React from 'react'
import { render, waitFor } from '@testing-library/react'

// pages under test
import LoginPage from '@/app/(public)/login/page'
import SignupPage from '@/app/(public)/signup/page'
import ForgotPasswordPage from '@/app/(public)/forgot-password/page'
import VerifyOtpPage from '@/app/(public)/verify-otp/page'
import ResetPasswordPage from '@/app/(public)/reset-password/page'

// Mock authService to simulate an already-authenticated user
jest.mock('@/services/auth.service', () => ({
  authService: {
    isAuthenticated: () => true,
    getCurrentUser: () => Promise.resolve({ id: 'u-test', email: 'a@b.com' })
  }
}))

// Mock next/navigation to capture router.replace
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }), useSearchParams: () => ({ get: (_: string) => null }) }));

describe('Prevent authenticated users from visiting public auth pages', () => {
  beforeEach(() => {
    replaceMock.mockReset()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('login page redirects when already logged in', async () => {
    render(<LoginPage />)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })

  test('signup page redirects when already logged in', async () => {
    render(<SignupPage />)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })

  test('forgot-password page redirects when already logged in', async () => {
    render(<ForgotPasswordPage />)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })

  test('verify-otp page redirects when already logged in', async () => {
    render(<VerifyOtpPage />)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })

  test('reset-password page redirects when already logged in', async () => {
    render(<ResetPasswordPage />)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })
})
