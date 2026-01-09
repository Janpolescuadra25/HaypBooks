/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import VerifyOtpPage from '@/app/(public)/verify-otp/page'

// Mock next/navigation to provide query params (flow can be changed by tests)
const mockPush = jest.fn()
let mockFlow = 'signup'
let mockSignupToken: string | null = 'token123'
let mockEmail: string | null = 'e@test.com'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: mockPush, back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => {
    if (k === 'phone') return '+15551234567'
    if (k === 'email') return mockEmail
    if (k === 'flow') return mockFlow
    if (k === 'signupToken') return mockSignupToken
    return null
  } })
}))

// Mock VerificationService to avoid network calls and return a dev OTP
jest.mock('@/services/verification.service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendEmailCode: jest.fn().mockResolvedValue({ otp: '123456' }),
    sendPhoneCode: jest.fn().mockResolvedValue({ otp: '123456' }),
    verifyPhoneCode: jest.fn().mockResolvedValue({ success: true }),
  }))
}))

// Mock authService.completeSignup
jest.mock('@/services/auth.service', () => ({ authService: { completeSignup: jest.fn().mockResolvedValue({ token: 't', user: { id: 'u1', email: 'e@test.com' } }), verifyOtp: jest.fn(), sendVerification: jest.fn() } }))

beforeEach(() => {
  mockPush.mockClear()
  mockFlow = 'signup'
  const { authService } = require('@/services/auth.service')
  authService.completeSignup.mockReset()
  authService.completeSignup.mockResolvedValue({ token: 't', user: { id: 'u1', email: 'e@test.com' } })
})

test('displays masked phone instead of raw phone when phone query provided (selection UI)', async () => {
  // Show selection UI by using a non-signup flow and clearing signup token and email
  mockFlow = undefined as any
  mockSignupToken = null
  mockEmail = null
  render(<VerifyOtpPage />)
  // Masked format should show country + dial and masked middle with last 4
  const masked = await screen.findAllByText(/\+1\s*\*\*\*\s*\*\*\*\s*4567/)
  expect(masked.length).toBeGreaterThan(0)
  // restore defaults for other tests
  mockFlow = 'signup'
  mockSignupToken = 'token123'
  mockEmail = 'e@test.com'
})

test('shows updated heading and subheading copy for direct-verify (signupToken)', async () => {
  render(<VerifyOtpPage />)
  expect(await screen.findByText(/Confirm your account/i)).toBeTruthy()
  // Subheading should indicate entering the code directly
  expect(await screen.findByText(/Almost there!/i)).toBeTruthy()
  expect(await screen.findByText(/6-digit code/i)).toBeTruthy()
  // Selection UI and "Try another method" should not be shown in direct signup verify flow
  expect(screen.queryByText(/Almost done! Select how you'd like to receive your verification code\./i)).toBeNull()
  expect(screen.queryByText(/Try another method/i)).toBeNull()
})

test('email and sms options act as action buttons and no continue/cancel are shown when no signupToken (non-signup flow)', async () => {
  // Simulate a non-signup flow (selection UI shown) with no signup token and no email
  mockFlow = undefined as any
  mockSignupToken = null
  mockEmail = null
  render(<VerifyOtpPage />)
  expect(await screen.findByTestId('verif-email-card')).toBeTruthy()
  expect(await screen.findByTestId('verif-phone-card')).toBeTruthy()
  // Subtext should indicate which address/phone will receive the code (both Email and SMS)
  const subs = await screen.findAllByText(/Send a verification code/i)
  expect(subs).toHaveLength(2)

  // Masked contacts should be visible for phone (email may be absent in this mode)
  const phones = await screen.findAllByText(/\+1 \*\*\* \*\*\* 4567/)
  expect(phones.length).toBeGreaterThan(0)

  expect(screen.queryByText(/Continue/)).toBeNull()
  expect(screen.queryByText(/Cancel/)).toBeNull()

  // restore
  mockFlow = 'signup'
  mockEmail = 'e@test.com'
})

test('shows selection after sign-in even when email query param is present', async () => {
  // Simulate coming from a sign-in flow: keep an email param but show selection
  mockFlow = 'signin'
  mockSignupToken = null
  mockEmail = 'e@test.com'
  render(<VerifyOtpPage />)
  expect(await screen.findByTestId('verif-email-card')).toBeTruthy()
  expect(await screen.findByTestId('verif-phone-card')).toBeTruthy()
  // restore
  mockFlow = 'signup'
  mockEmail = 'e@test.com'
  mockSignupToken = 'token123'
})

test('shows card-style selection and cancel link after sign-in', async () => {
  // Verify the new visual card layout and cancel action for signin flows
  mockFlow = 'signin'
  mockSignupToken = null
  mockEmail = 'e@test.com'
  render(<VerifyOtpPage />)

  // Heading should be the sign-in headed copy
  expect(await screen.findByText(/Confirm Your Identity/i)).toBeTruthy()
  expect(await screen.findByText(/Choose how you'd like to verify it's you/i)).toBeTruthy()

  // Email/phone cards should be present via data-testid
  expect(await screen.findByTestId('verif-email-card')).toBeTruthy()
  expect(await screen.findByTestId('verif-phone-card')).toBeTruthy()

  // Cancel verification link should be visible
  expect(await screen.findByText(/Cancel verification/i)).toBeTruthy()

  // restore
  mockFlow = 'signup'
  mockEmail = 'e@test.com'
  mockSignupToken = 'token123'
})

test('reset flow shows reset-specific message', async () => {
  // Switch mock flow to reset
  mockFlow = 'reset'
  render(<VerifyOtpPage />)
  expect(await screen.findByText(/We’ve emailed you a 6-digit code\. Enter it here to continue resetting your account\./i)).toBeTruthy()
  // restore
  mockFlow = 'signup'
})

import { waitFor, act } from '@testing-library/react'

test('clicking email option triggers send and navigates (non-signup flow)', async () => {
  mockFlow = undefined as any
  mockSignupToken = null
  mockEmail = null
  render(<VerifyOtpPage />)
  const emailBtn = await screen.findByTestId('verif-email-card')
  await act(async () => { emailBtn.click() })
  await waitFor(() => expect(mockPush).toHaveBeenCalled())
  mockFlow = 'signup'
  mockSignupToken = 'token123'
  mockEmail = 'e@test.com'
})

test('signup flow without signupToken auto-sends email and hides selection and try another method', async () => {
  // Simulate landing to verify from create-account (signup flow) without an explicit signupToken
  mockFlow = 'signup'
  mockSignupToken = null
  render(<VerifyOtpPage />)
  // Auto-send should trigger a navigation push (email sent)
  await waitFor(() => expect(mockPush).toHaveBeenCalled())
  // Selection UI should not be present
  expect(screen.queryByRole('button', { name: /email/i })).toBeNull()
  expect(screen.queryByRole('button', { name: /text messages \(sms\)/i })).toBeNull()
  // 'Try another method' should also be hidden
  expect(screen.queryByText(/Try another method/i)).toBeNull()
  mockFlow = 'signup'
  mockSignupToken = 'token123'
})

import VerifyOtpForm from '@/components/auth/VerifyOtpForm'

test('completing signup via OTP calls completeSignup and navigates into onboarding', async () => {
  render(<VerifyOtpForm email={"e@test.com"} flow="signup" signupToken="token123" />)
  const inputs = await screen.findAllByRole('textbox')
  expect(inputs).toHaveLength(6)
  // Enter a full 6-digit code by filling each input
  await act(async () => {
    for (let i = 0; i < inputs.length; i++) {
      fireEvent.change(inputs[i], { target: { value: '123456'[i] } })
    }
  })
  const continueBtn = await screen.findByRole('button', { name: /continue/i })
  await act(async () => { continueBtn.click() })
  await waitFor(() => expect(require('@/services/auth.service').authService.completeSignup).toHaveBeenCalled())
})

test('signup OTP completes after first verified method when both email+phone exist (OR policy)', async () => {
  const { authService } = require('@/services/auth.service')
  authService.completeSignup
    .mockResolvedValueOnce({ token: 't', user: { id: 'u1', email: 'e@test.com' } })

  render(<VerifyOtpForm email={"e@test.com"} phone={"+15551234567"} flow="signup" signupToken="token123" />)

  // Step 1: email
  const inputs1 = await screen.findAllByRole('textbox')
  await act(async () => {
    for (let i = 0; i < inputs1.length; i++) {
      fireEvent.change(inputs1[i], { target: { value: '123456'[i] } })
    }
  })
  await act(async () => {
    const continueBtn = await screen.findByRole('button', { name: /continue/i })
    continueBtn.click()
  })

  await waitFor(() => expect(authService.completeSignup).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(mockPush).toHaveBeenCalled())
})

test('back button navigates to signup when in signup flow', async () => {
  render(<VerifyOtpPage />)
  const backBtn = await screen.findByRole('button', { name: /back to sign up/i })
  await act(async () => { backBtn.click() })
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/signup'))
})