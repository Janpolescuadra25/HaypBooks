/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import VerifyOtpPage from '@/app/(public)/verify-otp/page'

// Mock next/navigation to provide query params (flow can be changed by tests)
const mockPush = jest.fn()
let mockFlow = 'signup'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: mockPush, back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => {
    if (k === 'phone') return '+15551234567'
    if (k === 'email') return 'e@test.com'
    if (k === 'flow') return mockFlow
    if (k === 'signupToken') return 'token123'
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

test('displays masked phone instead of raw phone when phone query provided', async () => {
  render(<VerifyOtpPage />)
  // Masked format should show country + dial and masked middle with last 4
  const masked = await screen.findByText(/\+1 \*\*\* \*\*\* 4567/)
  expect(masked).toBeTruthy()
})

test('shows updated heading and subheading copy', async () => {
  render(<VerifyOtpPage />)
  expect(await screen.findByText(/Confirm your account/i)).toBeTruthy()
  expect(await screen.findByText(/Almost done! Enter the code we sent to confirm it's you and secure your new account\./i)).toBeTruthy()
})

test('email and sms options act as action buttons and no continue/cancel are shown', async () => {
  render(<VerifyOtpPage />)
  expect(await screen.findByRole('button', { name: /email/i })).toBeTruthy()
  expect(await screen.findByRole('button', { name: /text messages \(sms\)/i })).toBeTruthy()
  // Subtext should indicate which address/phone will receive the code (both Email and SMS)
  const subs = await screen.findAllByText(/Verification code will be sent to:/i)
  expect(subs).toHaveLength(2)

  // Masked contacts should be visible for email and phone
  expect(await screen.findByText(/\*@test.com/)).toBeTruthy()
  expect(await screen.findByText(/\+1 \*\*\* \*\*\* 4567/)).toBeTruthy()

  expect(screen.queryByText(/Continue/)).toBeNull()
  expect(screen.queryByText(/Cancel/)).toBeNull()
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

test('clicking email option triggers send and navigates', async () => {
  render(<VerifyOtpPage />)
  const emailBtn = await screen.findByRole('button', { name: /email/i })
  await act(async () => { emailBtn.click() })
  await waitFor(() => expect(mockPush).toHaveBeenCalled())
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