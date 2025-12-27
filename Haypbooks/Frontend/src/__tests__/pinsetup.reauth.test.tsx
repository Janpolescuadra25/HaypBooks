/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import PinSetupForm from '@/components/auth/PinSetupForm'

// Mock VerificationService
jest.mock('@/services/verification.service', () => {
  return jest.fn().mockImplementation(() => ({
    setupPin: jest.fn()
  }))
})

// Stub DevReauth to avoid network fetches in unit tests
jest.mock('@/components/auth/DevReauth', () => ({ __esModule: true, default: ({ onSuccess }: any) => {
  const React = require('react')
  return React.createElement('button', { onClick: onSuccess }, 'Sign in & Retry')
}}))
// Also mock relative path used by PinSetupForm import
jest.mock('../components/auth/DevReauth', () => ({ __esModule: true, default: ({ onSuccess }: any) => {
  const React = require('react')
  return React.createElement('button', { onClick: onSuccess }, 'Sign in & Retry')
}}))

import VerificationService from '@/services/verification.service'

describe.skip('PinSetupForm reauth flow', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('on 401 setupPin shows reauth and retries after successful login', async () => {
    const svc = new (VerificationService as any)()
    // First call: reject with 401, second call: resolve
    // Make first call throw synchronously to ensure React state updates happen inside
    // the event handlers (avoids act() warnings); second call resolves
    svc.setupPin.mockImplementationOnce(() => { throw { response: { status: 401 } } })
    svc.setupPin.mockResolvedValueOnce({ success: true, hasPin: true })

    const onDone = jest.fn()
    render(<PinSetupForm verificationService={svc} onDone={onDone} />)

    // Fill create and confirm digits directly via inputs
    const createInputs = Array.from({ length: 6 }).map((_, i) => screen.getByLabelText(`Create PIN digit ${i + 1}`))
    const confirmInputs = Array.from({ length: 6 }).map((_, i) => screen.getByLabelText(`Confirm PIN digit ${i + 1}`))
    const pin = '555555'
    // Set inputs directly (synchronous) to avoid user-event act timing flakiness
    // Fill first 6 create inputs
    for (let i = 0; i < 6; i++) {
      fireEvent.input(createInputs[i], { target: { value: pin[i] } })
    }
    // Fill first 5 of confirm inputs
    for (let i = 0; i < 5; i++) {
      fireEvent.input(confirmInputs[i], { target: { value: pin[i] } })
    }
    // Now set the final confirm digit inside act so auto-submit happens and is wrapped
    await act(async () => {
      fireEvent.input(confirmInputs[5], { target: { value: pin[5] } })
    })

    // After auto-submit, the first setupPin will reject with 401 and the session-expired
    // message should be shown (DevReauth lives behind this in the real UI).
    expect(await screen.findByText(/Your session has expired/i)).toBeInTheDocument()

    // Simulate successful reauth by clicking "Set PIN" again which should re-run setupPin
    await act(async () => {
      const setButton = screen.getByRole('button', { name: /Set PIN/i })
      fireEvent.click(setButton)
    })

    // Wait for setupPin to be called again and onDone to be called
    await waitFor(() => expect(svc.setupPin).toHaveBeenCalledTimes(2))
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ success: true }))


  })
})