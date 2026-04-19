/**
 * Practice Hub smoke tests aligned with current UI behavior.
 *
 * The hub now mixes rich pages (Dashboard, Client List) and
 * documentation-first placeholder pages (PageDocumentation).
 * These tests intentionally assert current, stable behavior.
 */

import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (_key: string) => null }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }) as any
})

afterAll(() => {
  jest.restoreAllMocks()
})

import PracticeHubPage from '@/app/practice-hub/page'

async function renderHub() {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(<PracticeHubPage />)
  })
  return result!
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function clickPrimaryGroup(container: HTMLElement, groupLabel: string) {
  const button = container.querySelector(`[title="${groupLabel}"]`) as HTMLElement | null
  if (!button) throw new Error(`Primary group not found: ${groupLabel}`)
  await act(async () => {
    fireEvent.click(button)
  })
}

function getSideNav(container: HTMLElement) {
  const nav = container.querySelector('aside nav') as HTMLElement | null
  if (!nav) throw new Error('Secondary side nav was not found')
  return nav
}

async function expandCurrentGroupSections(container: HTMLElement) {
  const nav = getSideNav(container)
  const headers = Array.from(nav.querySelectorAll('button')).filter((button) => {
    const span = button.querySelector('span')
    return !!span && span.className.includes('tracking-widest')
  }) as HTMLElement[]

  for (const header of headers) {
    const iconClass = header.querySelector('svg')?.getAttribute('class') ?? ''
    if (iconClass.toLowerCase().includes('chevron-right')) {
      await act(async () => {
        fireEvent.click(header)
      })
    }
  }
}

async function clickNavItem(container: HTMLElement, itemLabel: string) {
  await expandCurrentGroupSections(container)
  const nav = getSideNav(container)
  const buttons = Array.from(nav.querySelectorAll('button')) as HTMLElement[]
  const item = buttons.find((button) => button.textContent?.trim() === itemLabel)
  if (!item) throw new Error(`Nav item not found: ${itemLabel}`)
  await act(async () => {
    fireEvent.click(item)
  })
}

async function navigateToSection(container: HTMLElement, group: string, item: string) {
  await clickPrimaryGroup(container, group)
  await clickNavItem(container, item)
}

describe('Practice Hub - Shell', () => {
  it('renders top bar and global search', async () => {
    await renderHub()
    expect(screen.getByText('Haypbooks')).toBeInTheDocument()
    expect(screen.getByText('Practice Hub')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search clients, tasks, reports/i)).toBeInTheDocument()
  })

  it('renders primary icon-rail groups', async () => {
    const result = await renderHub()
    const groups = ['Home', 'Clients', 'Work Mgmt', 'Workspace', 'Billing', 'Team', 'Analytics', 'Settings']
    groups.forEach((group) => {
      expect(result.container.querySelector(`[title="${group}"]`)).toBeTruthy()
    })
  })

  it('closes and reopens secondary nav panel', async () => {
    const result = await renderHub()
    expect(result.container.querySelector('aside nav')).toBeTruthy()

    const closeButton = result.container.querySelector('[title="Close panel"]') as HTMLElement | null
    expect(closeButton).toBeTruthy()
    await act(async () => {
      fireEvent.click(closeButton!)
    })
    expect(result.container.querySelector('aside nav')).toBeFalsy()

    const openButton = result.container.querySelector('[title="Open navigation"]') as HTMLElement | null
    expect(openButton).toBeTruthy()
    await act(async () => {
      fireEvent.click(openButton!)
    })
    expect(result.container.querySelector('aside nav')).toBeTruthy()
  })
})

describe('Practice Hub - Dashboard', () => {
  it('shows dashboard fallback content when API data is unavailable', async () => {
    await renderHub()
    expect(screen.getByRole('heading', { name: 'Practice Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh clients/i })).toBeInTheDocument()
    expect(screen.getByText('My Clients')).toBeInTheDocument()
  })

  it('opens and closes dashboard help modal', async () => {
    await renderHub()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open dashboard help/i }))
    })
    const modalHeading = screen.getByRole('heading', { name: 'Practice Dashboard Help' })
    expect(modalHeading).toBeInTheDocument()

    const modal = modalHeading.closest('div')?.parentElement as HTMLElement
    const closeButton = within(modal).getByRole('button', { name: 'Close' })
    await act(async () => {
      fireEvent.click(closeButton)
    })

    expect(screen.queryByRole('heading', { name: 'Practice Dashboard Help' })).not.toBeInTheDocument()
  })
})

describe('Practice Hub - Client List', () => {
  it('renders empty-state fallback and help modal', async () => {
    const result = await renderHub()
    await navigateToSection(result.container, 'Clients', 'My Clients')

    expect(screen.getByRole('heading', { name: 'Clients' })).toBeInTheDocument()
    expect(screen.getByText(/no clients match your filters/i)).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open client list help/i }))
    })
    expect(screen.getByRole('heading', { name: 'Client List Help' })).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    })
    expect(screen.queryByRole('heading', { name: 'Client List Help' })).not.toBeInTheDocument()
  })
})

const DOC_CASES: Array<{ group: string; item: string; title: string }> = [
  { group: 'Home', item: 'Practice Health', title: 'Practice Health' },
  { group: 'Home', item: 'Shortcuts', title: 'Shortcuts' },
  { group: 'Clients', item: 'Client Onboarding', title: 'Client Onboarding' },
  { group: 'Clients', item: 'Client Documents', title: 'Client Documents' },
  { group: 'Clients', item: 'Client Relationships', title: 'Client CRM & Leads' },
  { group: 'Clients', item: 'Communications', title: 'Communications' },
  { group: 'Work Mgmt', item: 'Work Queue', title: 'Work Queue' },
  { group: 'Work Mgmt', item: 'Work in Progress (WIP)', title: 'WIP Ledger' },
  { group: 'Work Mgmt', item: 'Calendar', title: 'Calendar' },
  { group: 'Workspace', item: 'Books Review', title: 'Books Review' },
  { group: 'Workspace', item: 'Reconciliation Hub', title: 'Reconciliation Hub' },
  { group: 'Workspace', item: 'Adjusting Entries', title: 'Adjusting Entries' },
  { group: 'Workspace', item: 'Client Requests', title: 'Client Requests' },
  { group: 'Billing', item: 'Invoice List', title: 'Invoice List' },
  { group: 'Billing', item: 'Rate Cards', title: 'Rate Cards' },
  { group: 'Settings', item: 'Details', title: 'Practice Profile' },
  { group: 'Settings', item: 'Subscriptions', title: 'Subscriptions' },
  { group: 'Settings', item: 'Templates', title: 'Templates' },
  { group: 'Settings', item: 'Integrations', title: 'Integrations' },
  { group: 'Team', item: 'Team Members', title: 'Team Members' },
  { group: 'Analytics', item: 'Client Reports', title: 'Client Analytics' },
]

describe.each(DOC_CASES)('Practice Hub docs panel - $title', ({ group, item, title }) => {
  it('renders docs prompt and modal flow', async () => {
    const result = await renderHub()
    await navigateToSection(result.container, group, item)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText(/content is coming soon/i)).toBeInTheDocument()

    const helpRegex = new RegExp(`open documentation for ${escapeRegex(title)}`, 'i')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: helpRegex }))
    })

    expect(screen.getByRole('heading', { name: `Documentation - ${title}` })).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /close documentation modal/i }))
    })
    expect(screen.queryByRole('heading', { name: `Documentation - ${title}` })).not.toBeInTheDocument()
  })
})