/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock useRouter
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

import HubSelectionModal from '@/components/HubSelectionModal'

describe('HubSelectionModal', () => {
  beforeEach(() => { jest.resetAllMocks(); (global as any).fetch = jest.fn() })

  test('shows accountant inline form when onboarding incomplete and completes flow', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true })
    // First two calls: onboarding/save and onboarding/complete; third: preferred-hub
    render(<HubSelectionModal user={{ id: 'u1', accountantOnboardingCompleted: false, companies: ['Acme Corp'] }} onClose={() => {}} />)

    // Owner side content should be present
    expect(screen.getByText(/For Owners/i)).toBeInTheDocument()
    expect(screen.getByText(/My Companies/i)).toBeInTheDocument()
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument()
    const ownerBtn = screen.getByRole('button', { name: /Enter Owner Hub/i })
    expect(ownerBtn).toBeInTheDocument()

    const acctBtn = screen.getByRole('button', { name: /Enter Accountant Hub/i })
    fireEvent.click(acctBtn)

    // Form should be displayed
    expect(screen.getByLabelText(/Firm name/i)).toBeInTheDocument()

    // Try submit empty -> inline validation
    const finishBtn = screen.getByRole('button', { name: /Finish setup/i })
    fireEvent.click(finishBtn)
    expect(screen.getByText(/firm name is required/i)).toBeInTheDocument()

    // Fill and submit
    const input = screen.getByPlaceholderText(/Your firm name/i)
    fireEvent.change(input, { target: { value: 'Rivera CPA' } })
    fireEvent.click(finishBtn)

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled())
    // Expect onboarding complete was called
    expect((global as any).fetch).toHaveBeenCalledWith('/api/onboarding/save', expect.anything())
    expect((global as any).fetch).toHaveBeenCalledWith('/api/onboarding/complete', expect.anything())
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/hub/accountant'))
  })
})