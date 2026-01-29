/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock useRouter
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

import HubSelectionModal from '@/components/HubSelectionModal'

describe('HubSelectionModal', () => {
  beforeEach(() => { jest.resetAllMocks(); (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }) })

  test('shows accountant inline form when onboarding incomplete and completes flow', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    // First two calls: onboarding/save and onboarding/complete; third: preferred-hub
    render(<HubSelectionModal user={{ id: 'u1', accountantOnboardingCompleted: false, companies: ['Acme Corp'] }} onClose={() => {}} />)

    // Owner side content should be present
    expect(screen.getByText(/My Companies/i)).toBeInTheDocument()
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument()
    const ownerBtn = screen.getByRole('button', { name: /ADD NEW VOLUME|Add New Volume/i })
    expect(ownerBtn).toBeInTheDocument()

    // Now when accountant onboarding is incomplete we show an "Open New Firm" CTA which opens the inline form
    const acctBtn = screen.getByTestId('create-acct')
    fireEvent.click(acctBtn)

    // Form should be displayed
    expect(screen.getByLabelText(/Accountant Workspace name/i)).toBeInTheDocument()

    // Try submit empty -> inline validation
    const finishBtn = screen.getByRole('button', { name: /Finish setup/i })
    fireEvent.click(finishBtn)
    expect(screen.getByText(/Accountant Workspace name is required/i)).toBeInTheDocument()

    // Fill and submit
    const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
    fireEvent.change(input, { target: { value: 'Rivera CPA' } })
    fireEvent.click(finishBtn)

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled())
    // Expect onboarding complete was called
    expect((global as any).fetch).toHaveBeenCalledWith('/api/onboarding/save', expect.anything())
    expect((global as any).fetch).toHaveBeenCalledWith('/api/onboarding/complete', expect.anything())
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/dashboard'))
  })

  test('shows Create Company CTA when user is an accountant without owner companies', async () => {
    render(<HubSelectionModal user={{ id: 'u2', role: 'accountant', companies: [] }} onClose={() => {}} />)

    // Owner side should show "Create Company" CTA
    const createCompanyBtn = screen.getByTestId('create-company')
    expect(createCompanyBtn).toBeInTheDocument()

    // Click should navigate to company creation
    fireEvent.click(createCompanyBtn)
    expect(replaceMock).toHaveBeenCalledWith('/companies?create=1')
  })


})