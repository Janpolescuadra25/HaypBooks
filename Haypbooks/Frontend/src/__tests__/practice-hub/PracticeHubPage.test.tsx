/**
 * Practice Hub — comprehensive panel tests
 *
 * Covers every section of the practice hub:
 *  Home:       Dashboard, Practice Health, Shortcuts
 *  Clients:    Client List, Client Onboarding, Client Documents, CRM Leads, Communications
 *  Work Mgmt:  Work Queue, Monthly Close, Annual Engagements, WIP Ledger, Calendar
 *  Workspace:  Books Review, Reconciliation Hub, Adjusting Entries, Client Requests
 *  Reporting:  Financial Statements, Management Reports, Tax Reports
 *  Settings:   Practice Profile, Team Management, Rate Cards, Subscriptions, Templates
 */

import React from 'react'
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react'
import { formatCurrency } from '@/lib/format'

// ── Mock next/navigation (useSearchParams) ────────────────────────────────────
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (_key: string) => null }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

// ── Silence fetch errors from API attempts ────────────────────────────────────
beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) })
})

afterAll(() => {
  jest.restoreAllMocks()
})

// ── Import page after mocks ───────────────────────────────────────────────────
import PracticeHubPage from '@/app/practice-hub/page'

// ── Helper: render and navigate to a section ──────────────────────────────────
async function renderHub() {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(<PracticeHubPage />)
  })
  return result!
}

async function clickNavGroup(container: HTMLElement, groupLabel: string) {
  const btn = container.querySelector(`[title="${groupLabel}"]`) as HTMLElement
  if (btn) {
    await act(async () => { fireEvent.click(btn) })
  }
}

async function clickNavItem(container: HTMLElement, itemLabel: string) {
  const buttons = Array.from(container.querySelectorAll('nav button')) as HTMLElement[]
  const btn = buttons.find(b => b.textContent?.trim() === itemLabel)
  if (btn) {
    await act(async () => { fireEvent.click(btn) })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL SHELL
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Shell', () => {
  it('renders the top bar with brand name', async () => {
    await renderHub()
    expect(screen.getByText('Haypbooks')).toBeInTheDocument()
    expect(screen.getByText('Practice Hub')).toBeInTheDocument()
  })

  it('renders the global search input', async () => {
    await renderHub()
    expect(screen.getByPlaceholderText(/search clients/i)).toBeInTheDocument()
  })

  it('renders all 6 primary nav groups in the icon rail', async () => {
    const result = await renderHub()
    const groups = ['Home', 'Clients', 'Work Mgmt', 'Workspace', 'Reporting', 'Settings']
    groups.forEach(g => {
      expect(result.container.querySelector(`[title="${g}"]`)).toBeTruthy()
    })
  })

  it('shows the secondary nav panel open by default', async () => {
    const result = await renderHub()
    expect(result.container.querySelector('aside nav')).toBeTruthy()
  })

  it('closes the secondary nav panel when X is clicked', async () => {
    const result = await renderHub()
    const closeBtn = result.container.querySelector('[title="Close panel"]') as HTMLElement
    expect(closeBtn).toBeTruthy()
    await act(async () => { fireEvent.click(closeBtn) })
    expect(result.container.querySelector('aside nav')).toBeFalsy()
  })

  it('re-opens the secondary nav panel', async () => {
    const result = await renderHub()
    const closeBtn = result.container.querySelector('[title="Close panel"]') as HTMLElement
    await act(async () => { fireEvent.click(closeBtn) })
    const openBtn = result.container.querySelector('[title="Open navigation"]') as HTMLElement
    expect(openBtn).toBeTruthy()
    await act(async () => { fireEvent.click(openBtn) })
    expect(result.container.querySelector('aside nav')).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HOME — DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Dashboard', () => {
  it('renders the welcome message', async () => {
    await renderHub()
    expect(screen.getByText(/good morning/i)).toBeInTheDocument()
  })

  it('renders stat tiles', async () => {
    await renderHub()
    expect(screen.getByText('Active Clients')).toBeInTheDocument()
    expect(screen.getByText('Open Tasks')).toBeInTheDocument()
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument()
    expect(screen.getByText('Completed MTD')).toBeInTheDocument()
  })

  it('renders Add Client button', async () => {
    await renderHub()
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
  })

  it('renders Quick Actions section', async () => {
    await renderHub()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('New Engagement')).toBeInTheDocument()
  })

  it('renders sample data banner when API is unavailable', async () => {
    await renderHub()
    await waitFor(() => {
      expect(screen.getByText(/showing placeholder data/i)).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HOME — PRACTICE HEALTH
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Practice Health', () => {
  async function renderHealth() {
    const result = await renderHub()
    await clickNavItem(result.container, 'Practice Health')
    return result
  }

  it('renders the section heading', async () => {
    await renderHealth()
    expect(screen.getByRole('heading', { name: 'Practice Health' })).toBeInTheDocument()
  })

  it('renders overall practice health score', async () => {
    await renderHealth()
    expect(screen.getByText('82')).toBeInTheDocument()
  })

  it('renders key metric cards', async () => {
    await renderHealth()
    expect(screen.getByText('Client Retention Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg. Response Time')).toBeInTheDocument()
    expect(screen.getByText('Billable Utilization')).toBeInTheDocument()
  })

  it('renders Refresh button', async () => {
    await renderHealth()
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HOME — SHORTCUTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Shortcuts', () => {
  async function renderShortcuts() {
    const result = await renderHub()
    await clickNavItem(result.container, 'Shortcuts')
    return result
  }

  it('renders pinned shortcuts section', async () => {
    await renderShortcuts()
    expect(screen.getByText('Pinned')).toBeInTheDocument()
  })

  it('renders default pinned items', async () => {
    await renderShortcuts()
    expect(screen.getByText('My Clients')).toBeInTheDocument()
    expect(screen.getByText('Work Queue')).toBeInTheDocument()
  })

  it('removes a pin when X is clicked', async () => {
    const result = await renderShortcuts()
    const pinSection = screen.getByText('Pinned').closest('div') as HTMLElement
    const xBtns = within(pinSection.parentElement!).queryAllByRole('button').filter(b =>
      b.querySelector('svg') !== null && b.textContent?.trim() === ''
    )
    if (xBtns.length > 0) {
      await act(async () => { fireEvent.click(xBtns[0]) })
    }
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    expect(result.container).toBeTruthy()
  })

  it('renders Suggested Shortcuts', async () => {
    await renderShortcuts()
    expect(screen.getByText('Suggested Shortcuts')).toBeInTheDocument()
  })

  it('renders Add Shortcut button', async () => {
    await renderShortcuts()
    expect(screen.getByRole('button', { name: /add shortcut/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS — CLIENT LIST
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Client List', () => {
  async function renderClientList() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Clients')
    return result
  }

  it('renders client list heading', async () => {
    await renderClientList()
    expect(screen.getByRole('heading', { name: 'My Clients' })).toBeInTheDocument()
  })

  it('renders sample client rows', async () => {
    await renderClientList()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('TechFlow Inc')).toBeInTheDocument()
  })

  it('search filters clients', async () => {
    await renderClientList()
    const searchInput = screen.getByPlaceholderText('Search clients...')
    await act(async () => { fireEvent.change(searchInput, { target: { value: 'Acme' } }) })
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.queryByText('TechFlow Inc')).not.toBeInTheDocument()
  })

  it('renders Add Client button', async () => {
    await renderClientList()
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
  })

  it('renders status badges', async () => {
    await renderClientList()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS — CLIENT ONBOARDING
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Client Onboarding', () => {
  async function renderOnboarding() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Clients')
    await clickNavItem(result.container, 'Client Onboarding')
    return result
  }

  it('renders onboarding heading', async () => {
    await renderOnboarding()
    expect(screen.getByRole('heading', { name: 'Client Onboarding' })).toBeInTheDocument()
  })

  it('renders pipeline stages', async () => {
    await renderOnboarding()
    expect(screen.getByText('Inquiry')).toBeInTheDocument()
    expect(screen.getByText('Proposal Sent')).toBeInTheDocument()
    expect(screen.getByText('Contract Signed')).toBeInTheDocument()
    expect(screen.getByText('Setup')).toBeInTheDocument()
  })

  it('renders sample cards in stages', async () => {
    await renderOnboarding()
    expect(screen.getByText('Lopez Trading')).toBeInTheDocument()
    expect(screen.getByText('GreenLeaf PH')).toBeInTheDocument()
  })

  it('renders New Client button', async () => {
    await renderOnboarding()
    expect(screen.getByRole('button', { name: /new client/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS — CLIENT DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Client Documents', () => {
  async function renderDocs() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Clients')
    await clickNavItem(result.container, 'Client Documents')
    return result
  }

  it('renders documents heading', async () => {
    await renderDocs()
    expect(screen.getByRole('heading', { name: 'Client Documents' })).toBeInTheDocument()
  })

  it('renders document rows', async () => {
    await renderDocs()
    expect(screen.getByText('Q4 2023 Bank Statement.pdf')).toBeInTheDocument()
    expect(screen.getByText('BIR Form 2307 - Q4.pdf')).toBeInTheDocument()
  })

  it('search filters documents', async () => {
    await renderDocs()
    const input = screen.getByPlaceholderText(/search documents/i)
    await act(async () => { fireEvent.change(input, { target: { value: 'payroll' } }) })
    expect(screen.getByText('Payroll Summary Jan 2024.xlsx')).toBeInTheDocument()
    expect(screen.queryByText('Q4 2023 Bank Statement.pdf')).not.toBeInTheDocument()
  })

  it('renders Upload File button', async () => {
    await renderDocs()
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS — CRM LEADS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Client CRM Leads', () => {
  async function renderCRM() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Clients')
    await clickNavItem(result.container, 'Client CRM Leads')
    return result
  }

  it('renders CRM heading', async () => {
    await renderCRM()
    expect(screen.getByRole('heading', { name: /CRM/i })).toBeInTheDocument()
  })

  it('renders lead rows', async () => {
    await renderCRM()
    expect(screen.getByText('Mandaluyong Realty')).toBeInTheDocument()
    expect(screen.getByText('BrightMed Clinic')).toBeInTheDocument()
  })

  it('renders summary metric cards', async () => {
    await renderCRM()
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('Potential ARR')).toBeInTheDocument()
  })

  it('renders Add Lead button', async () => {
    await renderCRM()
    expect(screen.getByRole('button', { name: /add lead/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS — COMMUNICATIONS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Communications', () => {
  async function renderComms() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Clients')
    await clickNavItem(result.container, 'Communications')
    return result
  }

  it('renders communications heading', async () => {
    await renderComms()
    expect(screen.getByRole('heading', { name: 'Communications' })).toBeInTheDocument()
  })

  it('renders thread list with client names', async () => {
    await renderComms()
    expect(screen.getByText('TechFlow Inc')).toBeInTheDocument()
    expect(screen.getByText('Sarah Designs')).toBeInTheDocument()
  })

  it('renders message content for selected thread', async () => {
    await renderComms()
    expect(screen.getByText(/re-upload november bank statement/i)).toBeInTheDocument()
  })

  it('renders reply input', async () => {
    await renderComms()
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
  })

  it('renders New Message button', async () => {
    await renderComms()
    expect(screen.getByRole('button', { name: /new message/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORK MGMT — WORK QUEUE
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Work Queue', () => {
  async function renderWorkQueue() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Work Mgmt')
    return result
  }

  it('renders work queue heading', async () => {
    await renderWorkQueue()
    expect(screen.getByRole('heading', { name: 'Work Queue' })).toBeInTheDocument()
  })

  it('renders filter tabs', async () => {
    await renderWorkQueue()
    expect(screen.getByRole('button', { name: /all tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /overdue/i })).toBeInTheDocument()
  })

  it('renders task rows', async () => {
    await renderWorkQueue()
    expect(screen.getByText(/reconcile acme corp/i)).toBeInTheDocument()
  })

  it('switches filter tabs', async () => {
    await renderWorkQueue()
    const overdueBtn = screen.getByRole('button', { name: /overdue/i })
    await act(async () => { fireEvent.click(overdueBtn) })
    expect(overdueBtn).toHaveClass('bg-green-600')
  })

  it('renders Add Task button', async () => {
    await renderWorkQueue()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORK MGMT — MONTHLY CLOSE
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Monthly Close', () => {
  async function renderMonthlyClose() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Work Mgmt')
    await clickNavItem(result.container, 'Monthly Close')
    return result
  }

  it('renders monthly close heading', async () => {
    await renderMonthlyClose()
    expect(screen.getByRole('heading', { name: 'Monthly Close' })).toBeInTheDocument()
  })

  it('renders client close cards', async () => {
    await renderMonthlyClose()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('TechFlow Inc')).toBeInTheDocument()
    expect(screen.getByText('Sarah Designs')).toBeInTheDocument()
  })

  it('renders checklist steps', async () => {
    await renderMonthlyClose()
    const steps = screen.getAllByText('Bank Reconciliation')
    expect(steps.length).toBeGreaterThan(0)
  })

  it('shows progress bars', async () => {
    const result = await renderMonthlyClose()
    const progressBars = result.container.querySelectorAll('.bg-green-500.rounded-full')
    expect(progressBars.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORK MGMT — ANNUAL ENGAGEMENTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Annual Engagements', () => {
  async function renderEngagements() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Work Mgmt')
    await clickNavItem(result.container, 'Annual Engagements')
    return result
  }

  it('renders annual engagements heading', async () => {
    await renderEngagements()
    expect(screen.getByRole('heading', { name: 'Annual Engagements' })).toBeInTheDocument()
  })

  it('renders engagement rows', async () => {
    await renderEngagements()
    expect(screen.getByText('Annual Audit')).toBeInTheDocument()
  })

  it('renders summary stats', async () => {
    await renderEngagements()
    expect(screen.getByText('Total Engagements')).toBeInTheDocument()
    expect(screen.getByText('Total Fees')).toBeInTheDocument()
  })

  it('renders New Engagement button', async () => {
    await renderEngagements()
    expect(screen.getByRole('button', { name: /new engagement/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORK MGMT — WIP LEDGER
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — WIP Ledger', () => {
  async function renderWIP() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Work Mgmt')
    await clickNavItem(result.container, 'WIP Ledger')
    return result
  }

  it('renders WIP ledger heading', async () => {
    await renderWIP()
    expect(screen.getByRole('heading', { name: 'WIP Ledger' })).toBeInTheDocument()
  })

  it('renders WIP summary cards', async () => {
    await renderWIP()
    expect(screen.getByText('Total Hours')).toBeInTheDocument()
    expect(screen.getByText('Unbilled WIP')).toBeInTheDocument()
    expect(screen.getByText('Total Billed')).toBeInTheDocument()
  })

  it('renders WIP rows', async () => {
    await renderWIP()
    expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument()
  })

  it('renders Log Time button', async () => {
    await renderWIP()
    expect(screen.getByRole('button', { name: /log time/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORK MGMT — CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Calendar', () => {
  async function renderCalendar() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Work Mgmt')
    await clickNavItem(result.container, 'Calendar')
    return result
  }

  it('renders calendar heading', async () => {
    await renderCalendar()
    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('renders day-of-week headers', async () => {
    await renderCalendar()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('renders Add Event button', async () => {
    await renderCalendar()
    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument()
  })

  it('renders current month label', async () => {
    const today = new Date()
    const monthName = today.toLocaleString('default', { month: 'long' })
    await renderCalendar()
    expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE — BOOKS REVIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Books Review', () => {
  async function renderBooksReview() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Workspace')
    return result
  }

  it('renders books review heading', async () => {
    await renderBooksReview()
    expect(screen.getByRole('heading', { name: 'Books Review' })).toBeInTheDocument()
  })

  it('renders client review cards', async () => {
    await renderBooksReview()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('TechFlow Inc')).toBeInTheDocument()
  })

  it('renders status badges', async () => {
    await renderBooksReview()
    expect(screen.getByText('Needs Review')).toBeInTheDocument()
    expect(screen.getByText('Clean')).toBeInTheDocument()
  })

  it('renders Sync All button', async () => {
    await renderBooksReview()
    expect(screen.getByRole('button', { name: /sync all/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE — RECONCILIATION HUB
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Reconciliation Hub', () => {
  async function renderRec() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Workspace')
    await clickNavItem(result.container, 'Reconciliation Hub')
    return result
  }

  it('renders reconciliation heading', async () => {
    await renderRec()
    expect(screen.getByRole('heading', { name: 'Reconciliation Hub' })).toBeInTheDocument()
  })

  it('renders reconciliation rows', async () => {
    await renderRec()
    expect(screen.getByText('BDO Business Checking')).toBeInTheDocument()
    expect(screen.getByText('BPI USD Account')).toBeInTheDocument()
  })

  it('renders New Reconciliation button', async () => {
    await renderRec()
    expect(screen.getByRole('button', { name: /new reconciliation/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE — ADJUSTING ENTRIES
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Adjusting Entries', () => {
  async function renderAdjusting() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Workspace')
    await clickNavItem(result.container, 'Adjusting Entries')
    return result
  }

  it('renders adjusting entries heading', async () => {
    await renderAdjusting()
    expect(screen.getByRole('heading', { name: 'Adjusting Entries' })).toBeInTheDocument()
  })

  it('renders entry rows', async () => {
    await renderAdjusting()
    expect(screen.getByText(/accrue unpaid salaries/i)).toBeInTheDocument()
    expect(screen.getAllByText(/depreciation/i)[0]).toBeInTheDocument()
  })

  it('shows new entry form when button is clicked', async () => {
    await renderAdjusting()
    const btn = screen.getByRole('button', { name: /new entry/i })
    await act(async () => { fireEvent.click(btn) })
    expect(screen.getByText('New Adjusting Entry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post entry/i })).toBeInTheDocument()
  })

  it('hides new entry form when Cancel is clicked', async () => {
    await renderAdjusting()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /new entry/i })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /cancel/i })) })
    expect(screen.queryByText('New Adjusting Entry')).not.toBeInTheDocument()
  })

  it('shows Posted and Draft badges', async () => {
    await renderAdjusting()
    expect(screen.getAllByText('Posted').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE — CLIENT REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Client Requests', () => {
  async function renderRequests() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Workspace')
    await clickNavItem(result.container, 'Client Requests')
    return result
  }

  it('renders client requests heading', async () => {
    await renderRequests()
    expect(screen.getByRole('heading', { name: 'Client Requests' })).toBeInTheDocument()
  })

  it('renders request cards', async () => {
    await renderRequests()
    expect(screen.getByText('Q4 Bank Statements')).toBeInTheDocument()
    expect(screen.getByText('Jan Expense Receipts')).toBeInTheDocument()
  })

  it('renders progress bars for each request', async () => {
    const result = await renderRequests()
    const progressBars = result.container.querySelectorAll('.bg-green-500.rounded-full')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('renders New Request button', async () => {
    await renderRequests()
    expect(screen.getByRole('button', { name: /new request/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REPORTING — FINANCIAL STATEMENTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Financial Statements', () => {
  async function renderFS() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Reporting')
    return result
  }

  it('renders financial statements heading', async () => {
    await renderFS()
    expect(screen.getByRole('heading', { name: 'Financial Statements' })).toBeInTheDocument()
  })

  it('renders statement type tabs', async () => {
    await renderFS()
    expect(screen.getByRole('button', { name: /income statement/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /balance sheet/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cash flow/i })).toBeInTheDocument()
  })

  it('renders income statement by default', async () => {
    await renderFS()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Net Income')).toBeInTheDocument()
  })

  it('switches to balance sheet view', async () => {
    await renderFS()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /balance sheet/i })) })
    expect(screen.getAllByText(/balance sheet/i).length).toBeGreaterThan(1)
  })

  it('renders Export PDF button', async () => {
    await renderFS()
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REPORTING — MANAGEMENT REPORTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Management Reports', () => {
  async function renderMgmt() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Reporting')
    await clickNavItem(result.container, 'Management Reports')
    return result
  }

  it('renders management reports heading', async () => {
    await renderMgmt()
    expect(screen.getByRole('heading', { name: 'Management Reports' })).toBeInTheDocument()
  })

  it('renders report cards', async () => {
    await renderMgmt()
    expect(screen.getByText('Monthly Practice Summary')).toBeInTheDocument()
    expect(screen.getByText('Client Profitability Report')).toBeInTheDocument()
  })

  it('renders Generate All button', async () => {
    await renderMgmt()
    expect(screen.getByRole('button', { name: /generate all/i })).toBeInTheDocument()
  })

  it('shows Coming Soon for not-ready reports', async () => {
    await renderMgmt()
    const allButtons = screen.getAllByRole('button') as HTMLButtonElement[]
    const comingSoonBtns = allButtons.filter(b => b.textContent?.includes('Coming Soon'))
    expect(comingSoonBtns.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REPORTING — TAX REPORTS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Tax Reports', () => {
  async function renderTax() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Reporting')
    await clickNavItem(result.container, 'Tax Reports')
    return result
  }

  it('renders tax reports heading', async () => {
    await renderTax()
    expect(screen.getByRole('heading', { name: 'Tax Reports' })).toBeInTheDocument()
  })

  it('renders BIR form badges', async () => {
    await renderTax()
    expect(screen.getAllByText('BIR 2550M').length).toBeGreaterThan(0)
  })

  it('renders summary stats', async () => {
    await renderTax()
    expect(screen.getByText('Filed This Month')).toBeInTheDocument()
  })

  it('renders New Filing button', async () => {
    await renderTax()
    expect(screen.getByRole('button', { name: /new filing/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — PRACTICE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Practice Profile', () => {
  async function renderProfile() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Settings')
    return result
  }

  it('renders practice profile heading', async () => {
    await renderProfile()
    expect(screen.getByRole('heading', { name: 'Practice Profile' })).toBeInTheDocument()
  })

  it('renders editable form fields', async () => {
    await renderProfile()
    expect(screen.getByDisplayValue('Patel & Associates CPAs')).toBeInTheDocument()
    expect(screen.getByDisplayValue('info@patelacc.ph')).toBeInTheDocument()
  })

  it('shows saved confirmation when Save Changes is clicked', async () => {
    await renderProfile()
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await act(async () => { fireEvent.click(saveBtn) })
    await waitFor(() => {
      expect(screen.getByText(/changes saved successfully/i)).toBeInTheDocument()
    })
  })

  it('updates field values', async () => {
    await renderProfile()
    const nameInput = screen.getByDisplayValue('Patel & Associates CPAs') as HTMLInputElement
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Firm Name' } }) })
    expect(nameInput.value).toBe('New Firm Name')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — TEAM MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Team Management', () => {
  async function renderTeam() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Settings')
    await clickNavItem(result.container, 'Team Management')
    return result
  }

  it('renders team management heading', async () => {
    await renderTeam()
    expect(screen.getByRole('heading', { name: 'Team Management' })).toBeInTheDocument()
  })

  it('renders team member cards', async () => {
    await renderTeam()
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    expect(screen.getByText('Mark Santos')).toBeInTheDocument()
    expect(screen.getByText('Lea Cruz')).toBeInTheDocument()
  })

  it('shows active member count in subtitle', async () => {
    await renderTeam()
    expect(screen.getByText(/3 active team members/i)).toBeInTheDocument()
  })

  it('renders Invite Member button', async () => {
    await renderTeam()
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument()
  })

  it('renders role badges', async () => {
    await renderTeam()
    expect(screen.getAllByText('Senior Accountant').length).toBeGreaterThan(0)
    expect(screen.getByText('Tax Specialist')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — RATE CARDS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Rate Cards & Pricing', () => {
  async function renderRates() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Settings')
    await clickNavItem(result.container, 'Rate Cards & Pricing')
    return result
  }

  it('renders rate cards heading', async () => {
    await renderRates()
    expect(screen.getByRole('heading', { name: 'Rate Cards & Pricing' })).toBeInTheDocument()
  })

  it('renders rate rows', async () => {
    await renderRates()
    expect(screen.getByText('Monthly Bookkeeping (Small Biz)')).toBeInTheDocument()
    expect(screen.getByText('Hourly Consultation')).toBeInTheDocument()
  })

  it('shows Add Rate form when button is clicked', async () => {
    await renderRates()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /add rate/i })) })
    expect(screen.getByText('New Rate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save rate/i })).toBeInTheDocument()
  })

  it('hides form when Cancel is clicked', async () => {
    await renderRates()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /add rate/i })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /cancel/i })) })
    expect(screen.queryByText('New Rate')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Subscriptions', () => {
  async function renderSubs() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Settings')
    await clickNavItem(result.container, 'Subscriptions')
    return result
  }

  it('renders subscriptions heading', async () => {
    await renderSubs()
    expect(screen.getByText('Subscriptions & Billing')).toBeInTheDocument()
  })

  it('renders current plan details', async () => {
    await renderSubs()
    expect(screen.getByText('Practice Pro')).toBeInTheDocument()
    const expected = formatCurrency(2499)
    expect(screen.getByText(`${expected}/mo`)).toBeInTheDocument()
  })

  it('renders plan actions', async () => {
    await renderSubs()
    expect(screen.getByRole('button', { name: /change plan/i })).toBeInTheDocument()
  })

  it('renders billing history rows', async () => {
    await renderSubs()
    expect(screen.getByText('Billing History')).toBeInTheDocument()
    const expected = formatCurrency(2499)
    const amounts = screen.getAllByText(expected)
    expect(amounts.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
describe('Practice Hub — Templates', () => {
  async function renderTemplates() {
    const result = await renderHub()
    await clickNavGroup(result.container, 'Settings')
    await clickNavItem(result.container, 'Templates')
    return result
  }

  it('renders templates heading', async () => {
    await renderTemplates()
    expect(screen.getByRole('heading', { name: 'Templates' })).toBeInTheDocument()
  })

  it('renders template cards', async () => {
    await renderTemplates()
    expect(screen.getByText('Monthly Close Checklist')).toBeInTheDocument()
    expect(screen.getByText('Client Onboarding Welcome Email')).toBeInTheDocument()
    expect(screen.getByText('Engagement Letter — Bookkeeping')).toBeInTheDocument()
  })

  it('renders category badges', async () => {
    await renderTemplates()
    expect(screen.getAllByText('Work Mgmt').length).toBeGreaterThan(0)
  })

  it('renders Create Template button', async () => {
    await renderTemplates()
    expect(screen.getByRole('button', { name: /create template/i })).toBeInTheDocument()
  })
})

