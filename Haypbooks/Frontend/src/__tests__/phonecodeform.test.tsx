import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
    expect(screen.getByText(/We will send a 6-digit code to/i)).toBeInTheDocument()

    const sendBtn = screen.getByRole('button', { name: /send code/i })
    const user = userEvent.setup()
    await user.click(sendBtn)
    expect(svc.sendPhoneCode).toHaveBeenCalledWith('+15551234567')
  })
})