import React from 'react'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

const routerMock = { replace: jest.fn(), push: jest.fn(), back: jest.fn(), refresh: jest.fn() }

jest.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => ({ get: (k: string) => null })
}))

jest.mock('@/services/auth.service', () => ({
  authService: {
    getCurrentUser: jest.fn()
  }
}))

// Mock verification service used by EmailCodeForm so we can simulate success
jest.mock('@/services/verification.service', () => {
  return jest.fn().mockImplementation(() => ({
    sendEmailCode: jest.fn().mockResolvedValue({ success: true, otp: '123456' }),
    verifyEmailCode: jest.fn().mockResolvedValue({ success: true }),
    sendPhoneCode: jest.fn().mockResolvedValue({ success: true, otp: '123456' }),
    verifyPhoneCode: jest.fn().mockResolvedValue({ success: true }),
  }))
})
import { authService } from '@/services/auth.service'
import VerificationPage from '@/app/verification/page'

describe('Verification page behavior', () => {
  afterEach(() => { jest.clearAllMocks() })

  test('initial view shows verification options', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    expect(await screen.findByText(/Email/i)).toBeInTheDocument()
  })

  test('shows SMS option even when user has no phone on file (allow add-phone flow)', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    // Email is present and SMS option should be visible to allow adding a phone
    expect(await screen.findByText(/Email/i)).toBeInTheDocument()
    expect(await screen.findByText(/Text Message \(SMS\)/i)).toBeInTheDocument()

    // Clicking SMS when there's no phone shows the AddPhoneForm
    const phoneBtn = await screen.findByTestId('option-phone')
    await act(async () => { phoneBtn.click() })
    expect(await screen.findByText(/Phone number/i)).toBeInTheDocument()

    // New UI: show 'Use another verification method' and Save & Send below the input
    expect(await screen.findByTestId('add-phone-other')).toBeInTheDocument()
    expect(await screen.findByTestId('add-phone-save')).toBeInTheDocument()

    // Clicking 'Use another verification method' returns to the options view
    const otherBtn = await screen.findByTestId('add-phone-other')
    await act(async () => { otherBtn.click() })
    expect(await screen.findByTestId('option-email')).toBeInTheDocument()
  })

  test('clicking SMS option opens phone form', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false, phone: '+15551234567' })

    render(<VerificationPage />)
    // wait for phone option to appear
    expect(await screen.findByText(/Text Message \(SMS\)/i)).toBeInTheDocument()
    const phoneBtn = await screen.findByTestId('option-phone')
    const user = userEvent.setup()
    await act(async () => { await user.click(phoneBtn) })

    expect(await screen.findByText(/Enter the\s*6.*code we sent to/i)).toBeInTheDocument()
  })

  test('shows sign-in banner and both options when arrived from sign-in', async () => {
    // Simulate being redirected from sign-in with email pre-filled
    window.history.pushState({}, '', '/verification?from=signin&email=test@b.com')
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'test@b.com', hasPin: false })

    render(<VerificationPage />)
    expect(await screen.findByText(/You were redirected here after signing in/i)).toBeInTheDocument()
    expect(await screen.findByTestId('option-email')).toBeInTheDocument()
    expect(await screen.findByTestId('option-phone')).toBeInTheDocument()
  })

  test('redirects to /workspace after successful email verification', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    const user = userEvent.setup()

    // Open the email flow by clicking the Email card
    const emailBtn = await screen.findByTestId('option-email')
    expect(emailBtn).toBeInTheDocument()
    await act(async () => { await user.click(emailBtn) })

    // EmailCodeForm should be visible
    expect(await screen.findByText(/Enter the\s*6.*code we sent to/i)).toBeInTheDocument()

    // Fill the mocked OTP digits and submit
    for (let i = 0; i < 6; i++) {
      const input = await screen.findByLabelText(new RegExp(`Verification code digit ${i + 1}`, 'i'))
      await act(async () => { await user.type(input, '123456'[i]) })
    }

    // click Verify code
    const verifyBtn = await screen.findByRole('button', { name: /Verify OTP|Verify code/i })

    // Prevent JSDOM navigation by stubbing location.assign and assert it was called
    await act(async () => { await user.click(verifyBtn) })

    expect(routerMock.replace).toHaveBeenCalledWith('/workspace')
  })

  test('redirects to /workspace after successful phone verification', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false, phone: '+15551234567' })

    render(<VerificationPage />)
    const user = userEvent.setup()

    // Open phone flow by clicking the SMS card
    const phoneBtn = await screen.findByTestId('option-phone')
    await act(async () => { await user.click(phoneBtn) })

    // PhoneCodeForm should be visible
    expect(await screen.findByText(/Enter the\s*6.*code we sent to/i)).toBeInTheDocument()

    // Fill the mocked OTP digits and submit
    for (let i = 0; i < 6; i++) {
      const input = await screen.findByLabelText(new RegExp(`Verification code digit ${i + 1}`, 'i'))
      await act(async () => { await user.type(input, '123456'[i]) })
    }

    // click Verify code
    const verifyBtn = await screen.findByRole('button', { name: /Verify OTP|Verify code/i })

    // Prevent JSDOM navigation by stubbing location.assign and assert it was called
    await act(async () => { await user.click(verifyBtn) })

    expect(routerMock.replace).toHaveBeenCalledWith('/workspace')
  })
})
