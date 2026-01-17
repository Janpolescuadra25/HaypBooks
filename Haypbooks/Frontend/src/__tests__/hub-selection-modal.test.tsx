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
    expect(screen.getByText(/For Owners/i)).toBeInTheDocument()
    expect(screen.getByText(/My Companies/i)).toBeInTheDocument()
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument()
    const ownerBtn = screen.getByRole('button', { name: /Enter Owner Workspace/i })
    expect(ownerBtn).toBeInTheDocument()

    // Now when accountant onboarding is incomplete we show a "Create Accountant Hub" CTA which opens the inline form
    const acctBtn = screen.getByRole('button', { name: /Create Accountant Hub/i })
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

  test('shows Create Company CTA when user is an accountant without owner companies', async () => {
    render(<HubSelectionModal user={{ id: 'u2', role: 'accountant', companies: [] }} onClose={() => {}} />)

    // Owner side should show "Create Company" CTA
    const createCompanyBtn = screen.getByRole('button', { name: /Create Company/i })
    expect(createCompanyBtn).toBeInTheDocument()

    // Click should navigate to company creation
    fireEvent.click(createCompanyBtn)
    expect(replaceMock).toHaveBeenCalledWith('/companies?create=1')
  })

  test('fetches live counts and displays them (as page)', async () => {
    // Provide empty user so that counts will be populated by fetch
    (global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.includes('/api/companies')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1' }, { id: 'c2' }]) })
      }
      if (url.includes('/api/tenants/clients')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }, { id: 't5' }]) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<HubSelectionModal user={{ id: 'u3', companies: [], clients: [] }} onClose={() => {}} asPage />)

    // Wait for counts to be fetched and displayed
    await waitFor(() => expect(screen.getByText(/2 active companies/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/5 active clients/i)).toBeInTheDocument())
  })
})