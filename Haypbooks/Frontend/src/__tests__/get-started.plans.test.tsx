import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

import GetStartedPlansPage from '@/app/get-started/plans/page'

jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { patch: jest.fn().mockResolvedValue({ data: {} }) } }))

describe('GetStartedPlansPage copy', () => {
  it('shows neutral company guidance for new or existing users', () => {
    render(<GetStartedPlansPage />)
    // Copy updated to reference Owner Workspace
    expect(screen.getByText(/Tell us the name of your Owner Workspace/i)).toBeInTheDocument()
  })

  it('shows error when owner workspace name missing and prevents navigation', async () => {
    render(<GetStartedPlansPage />)
    const startBtn = screen.getByRole('button', { name: /Start Free Trial/i })
    // wrap the click in act to avoid state update warnings
    act(() => { startBtn.click() })
    expect(await screen.findByText(/Owner Workspace name is required/i)).toBeInTheDocument()
  })

  it('persists company name to backend when provided', async () => {
    const api = require('@/lib/api-client').default
    render(<GetStartedPlansPage />)
    const input = screen.getByPlaceholderText(/e.g., Acme Widgets LLC/i)
    const startBtn = screen.getByRole('button', { name: /Start Free Trial/i })
    // fill and click
    // use fireEvent to let React update component state
    const { fireEvent } = require('@testing-library/react')
    fireEvent.change(input, { target: { value: 'Acme Widgets' } })
    act(() => { startBtn.click() })
    // wait for patch to be called
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/api/users/profile', { companyName: 'Acme Widgets' }))
  })
})
