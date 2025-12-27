import React from 'react'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

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

  test('initial view shows verification options and Continue button', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    expect(await screen.findByText(/Email/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Continue/i })).toBeInTheDocument()
  })

  test('selecting SMS option and clicking Continue opens phone form', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false, phone: '+15551234567' })

    render(<VerificationPage />)
    // wait for phone option to appear
    expect(await screen.findByText(/Text Message \(SMS\)/i)).toBeInTheDocument()
    const phoneRadio = await screen.findByLabelText(/Text Message \(SMS\)/i)
    const user = userEvent.setup()
    await act(async () => { await user.click(phoneRadio) })
    const continueBtn = await screen.findByRole('button', { name: /Continue/i })
    await act(async () => { await user.click(continueBtn) })

    expect(await screen.findByText(/Enter verification code/i)).toBeInTheDocument()
  })

  test('redirects to /hub/selection after successful email verification', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false })

    render(<VerificationPage />)
    const user = userEvent.setup()

    // Continue with default Email option
    const continueBtn = await screen.findByRole('button', { name: /Continue/i })
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    await act(async () => { await user.click(continueBtn) })

    // EmailCodeForm should be visible
    expect(await screen.findByText(/Enter verification code/i)).toBeInTheDocument()

    // Fill the mocked OTP digits and submit
    for (let i = 0; i < 6; i++) {
      const input = await screen.findByLabelText(new RegExp(`Verification code digit ${i + 1}`, 'i'))
      await act(async () => { await user.type(input, '123456'[i]) })
    }

    // click Verify code
    const verifyBtn = await screen.findByRole('button', { name: /Verify OTP|Verify code/i })

    // Prevent JSDOM navigation by stubbing location.assign and assert it was called
    const assignMock = jest.fn()
    // @ts-ignore
    const originalAssign = window.location.assign
    // @ts-ignore
    window.location.assign = assignMock

    await act(async () => { await user.click(verifyBtn) })

    expect(assignMock).toHaveBeenCalledWith('/hub/selection')

    // restore assign
    // @ts-ignore
    window.location.assign = originalAssign
  })

  test('redirects to /hub/selection after successful phone verification', async () => {
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ email: 'dev@example.com', hasPin: false, phone: '+15551234567' })

    render(<VerificationPage />)
    const user = userEvent.setup()

    // Open phone flow by selecting the SMS option then Continue
    const phoneRadio = await screen.findByLabelText(/Text Message \(SMS\)/i)
    await act(async () => { await user.click(phoneRadio) })
    const continueBtn = await screen.findByRole('button', { name: /Continue/i })
    await act(async () => { await user.click(continueBtn) })

    // PhoneCodeForm should be visible
    expect(await screen.findByText(/Enter verification code/i)).toBeInTheDocument()

    // Fill the mocked OTP digits and submit
    for (let i = 0; i < 6; i++) {
      const input = await screen.findByLabelText(new RegExp(`Verification code digit ${i + 1}`, 'i'))
      await act(async () => { await user.type(input, '123456'[i]) })
    }

    // click Verify code
    const verifyBtn = await screen.findByRole('button', { name: /Verify OTP|Verify code/i })

    // Prevent JSDOM navigation by stubbing location.assign and assert it was called
    const assignMock = jest.fn()
    // @ts-ignore
    const originalAssign = window.location.assign
    // @ts-ignore
    window.location.assign = assignMock

    await act(async () => { await user.click(verifyBtn) })

    expect(assignMock).toHaveBeenCalledWith('/hub/selection')

    // restore assign
    // @ts-ignore
    window.location.assign = originalAssign
  })
})
