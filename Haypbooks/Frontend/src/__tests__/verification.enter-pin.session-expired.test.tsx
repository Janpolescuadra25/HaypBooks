/** @jest-environment jsdom */
import React from 'react'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import VerificationPage from '@/app/verification/page'

jest.mock('@/services/auth.service', () => ({
  authService: {
    getCurrentUser: jest.fn()
  }
}))
import { authService } from '@/services/auth.service'

describe('Verification page - session expired path', () => {
  afterEach(() => { jest.clearAllMocks() })

  test('shows session expired message and actions when getCurrentUser returns 401', async () => {
    // Make all calls reject with 401 so both initial load and enter-pin checks fail
    ;(authService.getCurrentUser as jest.Mock).mockRejectedValue({ response: { status: 401 } })

    render(<VerificationPage />)
    const enterBtn = await screen.findByRole('button', { name: /Enter Your PIN/i })
    const user = userEvent.setup()
    const { act } = require('react-dom/test-utils')
    await act(async () => { await user.click(enterBtn) })

    // Expect session expired message to be shown and Sign in + Switch account actions to appear
    const matches = await screen.findAllByText(/Your session has expired/i)
    expect(matches.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
    const switchButtons = screen.getAllByRole('button', { name: /Switch account/i })
    expect(switchButtons.length).toBeGreaterThan(0)
  })
})