import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

import GetStartedPlansPage from '@/app/get-started/plans/page'

jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { patch: jest.fn().mockResolvedValue({ data: {} }), post: jest.fn().mockResolvedValue({ data: {} }) } }))

describe('GetStartedPlansPage copy', () => {
  it('shows neutral company guidance for new or existing users', () => {
    render(<GetStartedPlansPage />)
    // Copy updated to reference Workspace
    expect(screen.getByText(/Tell us the name of your workspace/i)).toBeInTheDocument()
  })

  it('shows error when workspace name missing and prevents navigation', async () => {
    render(<GetStartedPlansPage />)
    const startBtn = screen.getByRole('button', { name: /Start Free Trial/i })
    // wrap the click in act to avoid state update warnings
    act(() => { startBtn.click() })
    expect(await screen.findByText(/Workspace name is required/i)).toBeInTheDocument()
  })

  it('persists workspace name to onboarding save when provided, and updates local storage', async () => {
    const api = require('@/lib/api-client').default
    render(<GetStartedPlansPage />)
    const input = screen.getByPlaceholderText(/e.g., Acme Widgets LLC/i)
    const startBtn = screen.getByRole('button', { name: /Start Free Trial/i })
    // fill and click
    // use fireEvent to let React update component state
    const { fireEvent } = require('@testing-library/react')
    fireEvent.change(input, { target: { value: 'Acme Widgets' } })
    // seed stored user so local storage update can be verified
    localStorage.setItem('user', JSON.stringify({ id: 'u-test', email: 'a@b.com', onboardingCompleted: false }))

    act(() => { startBtn.click() })

    // onboarding save should be called with workspaceName
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/onboarding/save', { step: 'owner_workspace', data: { workspaceName: 'Acme Widgets' } }))

    // local storage should be updated with workspaceName
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    expect(stored.workspaceName).toBe('Acme Widgets')
  })
})
