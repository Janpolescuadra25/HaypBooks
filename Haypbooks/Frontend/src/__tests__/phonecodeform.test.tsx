import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

jest.mock('@/services/verification.service', () => {
  return jest.fn().mockImplementation(() => ({
    sendPhoneCode: jest.fn().mockResolvedValue({ success: true }),
    verifyPhoneCode: jest.fn().mockResolvedValue({ success: true }),
  }))
})

import PhoneCodeForm from '@/components/auth/PhoneCodeForm'

describe('PhoneCodeForm', () => {
  test('shows masked phone and calls sendPhoneCode', async () => {
    const svc = new (require('@/services/verification.service') as any)()
    const onSuccess = jest.fn()
    render(<PhoneCodeForm phone='+15551234567' onSuccess={onSuccess} verificationService={svc} />)
    expect(screen.getByText(/\+1 \*\*\* \*\*\* 4567/)).toBeInTheDocument()

    const resendBtn = screen.getByRole('button', { name: /resend/i })
    const user = userEvent.setup()
    await act(async () => { await user.click(resendBtn) })
    expect(svc.sendPhoneCode).toHaveBeenCalledWith('+15551234567')
    expect(await screen.findByText(/Code resent/i)).toBeInTheDocument()
  })
})