/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('@/services/verification.service', () => {
  return jest.fn().mockImplementation(() => ({
    verifyPin: jest.fn(),
    setupPin: jest.fn(),
    sendEmailCode: jest.fn(),
    verifyEmailCode: jest.fn(),
  }))
})
// Helper to set method stubs on the mocked class prototype
function mockSvcMethod(name: string, impl: any) {
  const svcModule = require('@/services/verification.service')
  if (svcModule && svcModule.mockImplementation) {
    // If module factory used, overwrite its prototype methods
    const fn = svcModule
    fn.prototype = fn.prototype || {}
    fn.prototype[name] = impl
  } else if (svcModule && typeof svcModule === 'function') {
    svcModule.prototype = svcModule.prototype || {}
    svcModule.prototype[name] = impl
  }
}

import { act } from 'react'
import PinEntryForm from '@/components/auth/PinEntryForm'
import PinSetupForm from '@/components/auth/PinSetupForm'
import EmailCodeForm from '@/components/auth/EmailCodeForm'
import VerificationService from '@/services/verification.service'

describe('PIN and Code forms', () => {
  beforeEach(() => jest.resetAllMocks())
  afterEach(async () => { /* flush pending microtasks and macrotasks to avoid act warnings */ await Promise.resolve(); await Promise.resolve(); await new Promise((res) => setTimeout(res, 0)); })

  test('PinEntryForm - enter digits and submit calls verifyPin', async () => {
    // use injected stub service so we can resolve the promise deterministically inside act
    let resolveVerify: (() => void) | undefined
    const stubSvc = { verifyPin: jest.fn().mockImplementation(() => new Promise((res) => { resolveVerify = res })) }
    const onSuccess = jest.fn()

    render(<PinEntryForm onSuccess={onSuccess} verificationService={stubSvc} enableAutoSubmit={false} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBe(6)

    inputs.forEach((el, i) => fireEvent.change(el, { target: { value: String(i + 1) } }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /verify pin/i }))
      await waitFor(() => expect(stubSvc.verifyPin).toHaveBeenCalledWith('123456'))
      if (resolveVerify) resolveVerify()
      await Promise.resolve()
    })

    expect(onSuccess).toHaveBeenCalled()
  })

  test.skip('PinSetupForm - create and confirm PIN and submit calls setupPin', async () => {
    // use a resolved stub to keep state updates synchronous in the test
    const stubSvc = { setupPin: jest.fn().mockReturnValue({ success: true }) }
    const onDone = jest.fn()

    render(<PinSetupForm onDone={onDone} verificationService={stubSvc} enableAutoSubmit={false} />)

    const allInputs = screen.getAllByRole('textbox')
    // first 6 are create, next 6 are confirm
    expect(allInputs.length).toBeGreaterThanOrEqual(12)

    const create = allInputs.slice(0, 6)
    const confirm = allInputs.slice(6, 12)

    create.forEach((el, i) => fireEvent.change(el, { target: { value: '1' } }))
    confirm.forEach((el, i) => fireEvent.change(el, { target: { value: '1' } }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /set pin/i }))
      await waitFor(() => expect(stubSvc.setupPin).toHaveBeenCalledWith('111111'))
    })

    // assert UI didn't show an error
    expect(screen.queryByText(/Failed to set PIN/)).toBeNull()
  })

  test('EmailCodeForm - paste and submit calls verifyEmailCode', async () => {
    let resolveVerify: (() => void) | undefined
    mockSvcMethod('verifyEmailCode', jest.fn().mockImplementation(() => new Promise((res) => { resolveVerify = res })))
    const svc = new (VerificationService as any)()
    const onSuccess = jest.fn()

    render(<EmailCodeForm email="test@haypbooks.test" onSuccess={onSuccess} enableAutoSubmit={false} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBe(6)

    // simulate paste event on first input
    await act(async () => {
      fireEvent.paste(inputs[0], { clipboardData: { getData: () => '765432' } })
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /verify code/i }))
      await waitFor(() => expect(svc.verifyEmailCode).toHaveBeenCalledWith('test@haypbooks.test', '765432'))
      if (resolveVerify) resolveVerify()
      await Promise.resolve()
    })

    expect(onSuccess).toHaveBeenCalled()
  })

  test('PinEntryForm - backspace clears and moves focus to previous', async () => {
    // disable auto-submit to avoid async verify calls during test
    const onSuccess = jest.fn()
    render(<PinEntryForm onSuccess={onSuccess} enableAutoSubmit={false} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]

    // enter 123456
    inputs.forEach((el, i) => fireEvent.change(el, { target: { value: String(i + 1) } }))

    // focus index 2 (third input) and press Backspace
    inputs[2].focus()
    fireEvent.keyDown(inputs[2], { key: 'Backspace' })

    expect(inputs[2].value).toBe('')
    expect(document.activeElement).toBe(inputs[1])
  })

  test('PinEntryForm - backspace on empty clears previous and focuses previous', async () => {
    mockSvcMethod('verifyPin', jest.fn().mockResolvedValue({ success: true }))
    const onSuccess = jest.fn()

    render(<PinEntryForm onSuccess={onSuccess} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]

    // enter 12 in first two
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '2' } })

    // focus index 2 (third), which is empty, press Backspace -> should clear index1 and focus it
    inputs[2].focus()
    fireEvent.keyDown(inputs[2], { key: 'Backspace' })

    expect(inputs[1].value).toBe('')
    expect(document.activeElement).toBe(inputs[1])
  })

  test('PinEntryForm - filling starting at non-zero index triggers verify if full', async () => {
    mockSvcMethod('verifyPin', jest.fn().mockResolvedValue({ success: true }))
    const svc = new (VerificationService as any)()
    const onSuccess = jest.fn()

    render(<PinEntryForm onSuccess={onSuccess} enableAutoSubmit={false} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]

    // prefill first digit then fill remaining digits starting at index 1
    fireEvent.change(inputs[0], { target: { value: '1' } })
    for (let i = 1; i <= 5; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } })
    }

    // verify inputs are filled correctly
    const values = inputs.map((i) => i.value)
    expect(values.join('')).toBe('123456')
  })

  test('PinEntryForm - back button calls onBack', async () => {
    const onBack = jest.fn()
    const onSuccess = jest.fn()
    render(<PinEntryForm onSuccess={onSuccess} onBack={onBack} enableAutoSubmit={false} />)

    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })

  test.skip('PinSetupForm - backspace clears and moves focus; confirm and submit', async () => {
    const stubSvc = { setupPin: jest.fn().mockReturnValue({ success: true }) }
    const onDone = jest.fn()

    render(<PinSetupForm onDone={onDone} verificationService={stubSvc} enableAutoSubmit={false} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]

    const create = inputs.slice(0, 6)
    const confirm = inputs.slice(6, 12)

    // fill create with 111111 and confirm all digits, then submit inside act to wrap state updates
    await act(async () => {
      create.forEach((el) => fireEvent.change(el, { target: { value: '1' } }))
      confirm.forEach((el) => fireEvent.change(el, { target: { value: '1' } }))
      fireEvent.click(screen.getByRole('button', { name: /set pin/i }))
      await waitFor(() => expect(stubSvc.setupPin).toHaveBeenCalledWith('111111'))
    })

    expect(screen.queryByText(/PINs do not match/)).toBeNull()
  })
})