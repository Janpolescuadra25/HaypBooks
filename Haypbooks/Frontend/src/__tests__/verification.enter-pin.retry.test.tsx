/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

jest.mock('@/services/auth.service', () => ({
  authService: { getCurrentUser: jest.fn() }
}))
import { authService } from '@/services/auth.service'
import VerificationPage from '@/app/verification/page'

describe.skip('Verification page retry behavior - SKIPPED (PIN removed)', () => {
  afterEach(() => { jest.clearAllMocks() })

  test('retries on transient failures and succeeds when server recovers', async () => {
    // First two calls fail, third succeeds indicating hasPin
    const mk = authService.getCurrentUser as jest.Mock
    mk.mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ email: 'recovery@x.test', hasPin: true })

    render(<VerificationPage />)
    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()

    await act(async () => { await user.click(enterBtn) })

    // Should eventually show the entry inputs after retries
    expect(await screen.findByLabelText('Enter PIN digit 1')).toBeInTheDocument()
  })

  test('shows Retry button on persistent failure and Retry triggers a new attempt', async () => {
    // reduce retries for fast test
    process.env.NEXT_PUBLIC_VERIFICATION_MAX_ATTEMPTS = '1'
    const mk = authService.getCurrentUser as jest.Mock
    mk.mockRejectedValue(new Error('network')) // all attempts fail initially

    render(<VerificationPage />)
    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()

    await act(async () => { await user.click(enterBtn) })

    // After the single attempt, error should be shown with Retry button
    expect(await screen.findByRole('button', { name: /Retry/i })).toBeInTheDocument()
    const retry = screen.getByRole('button', { name: /Retry/i })

    // Now make the next attempt succeed
    mk.mockResolvedValueOnce({ email: 'ok@x.test', hasPin: true })
    await act(async () => { await user.click(retry) })

    // Should proceed to entry view
    expect(await screen.findByLabelText('Enter PIN digit 1')).toBeInTheDocument()
  })
})