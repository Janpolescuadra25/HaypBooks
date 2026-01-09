import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'

jest.mock('@/services/verification.service', () => {
  return jest.fn().mockImplementation(() => ({
    sendPhoneCode: jest.fn().mockResolvedValue({ success: true, otp: '123456' })
  }))
})

import AddPhoneForm from '@/components/auth/AddPhoneForm'

describe('AddPhoneForm', () => {
  beforeEach(() => {
    // mock fetch for saving phone
    ;(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) })
  })
  afterEach(() => { jest.clearAllMocks() })

  test('renders input and action buttons and calls onCancel', async () => {
    const onCancel = jest.fn()
    const onSaved = jest.fn()

    render(<AddPhoneForm onSaved={onSaved} onCancel={onCancel} />)

    expect(await screen.findByLabelText(/Phone number input/i)).toBeInTheDocument()
    expect(await screen.findByTestId('add-phone-other')).toBeInTheDocument()
    expect(await screen.findByTestId('add-phone-save')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('add-phone-other'))
    expect(onCancel).toHaveBeenCalled()
  })

  test('saves phone and calls onSaved', async () => {
    const onSaved = jest.fn()
    render(<AddPhoneForm onSaved={onSaved} />)

    const input = await screen.findByLabelText(/Phone number input/i)
    fireEvent.change(input, { target: { value: '+15550001111' } })

    fireEvent.click(screen.getByTestId('add-phone-save'))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('+15550001111'))
  })
})