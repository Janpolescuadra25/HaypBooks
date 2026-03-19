import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// mock next/navigation for router interactions
const pushMock = jest.fn()
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: replaceMock, back: jest.fn(), refresh: jest.fn() }) }))

// mock api client for profile fetch
const apiClientGetMock = jest.fn()
jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { get: apiClientGetMock } }))

import WorkspacePage, { BookCard } from '@/components/workspace/WorkspacePage'
import HubSelectionModal from '@/components/HubSelectionModal'

// mock authService since our workspace handler calls logout
const logoutMock = jest.fn(() => Promise.resolve())
jest.mock('@/services/auth.service', () => ({ authService: { logout: logoutMock } }))

describe('Workspace & hub selection navigation', () => {
  beforeEach(() => {
    pushMock.mockClear()
    logoutMock.mockClear()
  })

  it('clicking Add New Company on WorkspacePage navigates to plan selection', async () => {
    render(<WorkspacePage />)
    const button = screen.getByText(/Add New Company/i)
    await userEvent.click(button)
    expect(pushMock).toHaveBeenCalledWith('/get-started/plans')
  })

  it('create-company button in HubSelectionModal routes to plan selection', async () => {
    // simulate a user who is an accountant without existing owner companies
    const user = { companies: [], role: 'accountant' }
    render(<HubSelectionModal user={user} />)
    const btn = screen.getByTestId('create-company')
    await userEvent.click(btn)
    expect(pushMock).toHaveBeenCalledWith('/get-started/plans')
  })

  it('clicking a practice entry navigates to practice hub dashboard with id', async () => {
    // arrange profile response
    apiClientGetMock.mockResolvedValue({ data: { name: 'Test', companies: [], practices: [{ id: 'p1', name: 'Hayppracticehub' }] } })

    render(<WorkspacePage />)
    const row = await screen.findByText('Hayppracticehub')
    await userEvent.click(row)
    expect(pushMock).toHaveBeenCalledWith('/practice-hub/dashboard?practiceId=p1')
  })

  it('switch account on WorkspacePage logs out and navigates to login', async () => {
    render(<WorkspacePage />)
    const switchBtn = screen.getByTestId('switch-account')
    await userEvent.click(switchBtn)
    // expect authService.logout was called and router navigated to /login
    expect(logoutMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('confirming a company on WorkspacePage updates preferred workspace, patches last-accessed and navigates with company query', async () => {
    // arrange profile response with one company
    apiClientGetMock.mockResolvedValue({ data: { name: 'Test', companies: [{ id: 'c1', name: 'MyCo' }], practices: [] } })
    // spy on global fetch
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((url: any, opts?: any) => {
      if (typeof url === 'string' && url.includes('/api/users/preferred-workspace')) {
        return Promise.resolve({ ok: true, json: async () => ({}) } as any)
      }
      if (typeof url === 'string' && url.includes('/api/companies/') && url.includes('/last-accessed')) {
        return Promise.resolve({ ok: true } as any)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any)
    })

    render(<WorkspacePage />)
    const row = await screen.findByText('MyCo')
    await userEvent.click(row)
    const confirmBtn = await screen.findByTestId('confirm-company')
    await userEvent.click(confirmBtn)

    expect(fetchSpy).toHaveBeenCalledWith('/api/users/preferred-workspace', expect.anything())
    expect(fetchSpy).toHaveBeenCalledWith('/api/companies/c1/last-accessed', expect.objectContaining({ method: 'PATCH' }))
    expect(replaceMock).toHaveBeenCalledWith('/dashboard?company=c1')
    fetchSpy.mockRestore()
  })

  it('+ New Practice button navigates to practice onboarding', async () => {
    render(<WorkspacePage />)
    const btn = screen.getByText(/\+ New Practice/i)
    await userEvent.click(btn)
    expect(pushMock).toHaveBeenCalledWith('/onboarding/practice')
  })

  it('HubSelectionModal practice CTA routes to onboarding when no firm exists', async () => {
    const user = { practiceFirms: [], role: 'accountant' }
    render(<HubSelectionModal user={user} />)
    const btn = screen.getByTestId('enter-acct')
    await userEvent.click(btn)
    expect(pushMock).toHaveBeenCalledWith('/onboarding/practice')
  })

  it('BookCard displays items in a table when expanded', () => {
    const sampleItems = [
      { id: '1', name: 'First Co' },
      { id: '2', name: 'Second LLC' }
    ]
    render(
      <BookCard
        title="Test"
        subtitle="sub"
        items={sampleItems}
        emptyText="none"
        buttonText="btn"
        color="bg-red-100"
        accentColor="bg-red-200"
        delay={0}
        isExpanded={true}
        onExpand={() => {}}
        onItemClick={() => {}}
        onCtaClick={() => {}}
      />
    )
    // expect a table row for each item
    expect(screen.getByText('First Co')).toBeInTheDocument()
    expect(screen.getByText('Second LLC')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3) // header + 2 rows
  })
})
