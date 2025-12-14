/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'

import SetupLanding from '@/app/account-and-settings/payments/setup/page'
import OwnerPage from '@/app/account-and-settings/payments/setup/owner/page'
import DepositPage from '@/app/account-and-settings/payments/setup/deposit/page'
import ReviewPage from '@/app/account-and-settings/payments/setup/review/page'

// Default mock for next/navigation; tests override when they need to capture replace()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}))

describe('Payments setup sequential wizard', () => {
  beforeEach(() => {
    // Reset localStorage between tests
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  test('Landing shows only current step: Business first', () => {
    const { container } = render(<SetupLanding />)
    // Shows the Business step card with Start link to business
    expect(screen.getAllByText(/About your business/i).length).toBeGreaterThanOrEqual(1)
    const startLink = screen.getByRole('link', { name: /start/i }) as HTMLAnchorElement
    expect(startLink.getAttribute('href')).toBe('/account-and-settings/payments/setup/business')
    // No direct links to owner or deposit
    expect(container.querySelector('a[href="/account-and-settings/payments/setup/owner"]')).toBeNull()
    expect(container.querySelector('a[href="/account-and-settings/payments/setup/deposit"]')).toBeNull()
  })

  test('Landing advances to Owner when Business is completed', async () => {
    localStorage.setItem('hb.payments.enroll.business', JSON.stringify({ legalName: 'ACME', entityType: 'llc', taxId: '12-3456789', address: '123 Anywhere' }))
    render(<SetupLanding />)
    expect(await screen.findByText(/About you/i)).toBeInTheDocument()
    expect(screen.queryByText(/About your business/i)).toBeNull()
  })

  test('Owner page redirects to Business if Business not completed', async () => {
    const replaces: string[] = []
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(), refresh: jest.fn(), back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)
    render(<OwnerPage />)
    await waitFor(() => expect(replaces.includes('/account-and-settings/payments/setup/business')).toBeTruthy())
  })

  test('Deposit page redirects to Owner if Owner not completed', async () => {
    const replaces: string[] = []
    localStorage.setItem('hb.payments.enroll.business', JSON.stringify({ legalName: 'ACME', entityType: 'llc', taxId: '12-3456789', address: '123 Anywhere' }))
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(), refresh: jest.fn(), back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)
    render(<DepositPage />)
    await waitFor(() => expect(replaces.includes('/account-and-settings/payments/setup/owner')).toBeTruthy())
  })

  test('Review page redirects to first incomplete step', async () => {
    const replaces: string[] = []
    // Only Business set; expect redirect to Owner
    localStorage.setItem('hb.payments.enroll.business', JSON.stringify({ legalName: 'ACME', entityType: 'llc', taxId: '12-3456789', address: '123 Anywhere' }))
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(), refresh: jest.fn(), back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)
    render(<ReviewPage />)
    await waitFor(() => expect(replaces.includes('/account-and-settings/payments/setup/owner')).toBeTruthy())
  })
})
