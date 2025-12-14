import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { restoreActWarningInterception, interceptActWarnings } from '@/test-utils/act-helpers'

jest.mock('@/lib/rbac-server', () => ({ getRoleFromCookies: () => 'admin', hasPermission: () => true }))

describe('AccountMergeButton UI', () => {
  beforeAll(() => {
    // Relax act warnings for this suite to avoid false positives from user-event's async flows
    restoreActWarningInterception()
    interceptActWarnings({ mode: 'collect' })
  })
  afterAll(() => {
    restoreActWarningInterception()
  })
  beforeEach(() => {
    ;(global as any).fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('loads eligible targets and posts merge', async () => {
    const user = userEvent.setup()
    const { AccountMergeButton } = await import('@/components/AccountMergeButton')
    const mockFetch = (global as any).fetch as jest.Mock

    // First call loads accounts (includeInactive=1)
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ accounts: [
      { id: 'src', number: '7001', name: 'Src', type: 'Expense', active: true },
      { id: 'tgt', number: '7002', name: 'Tgt', type: 'Expense', active: true },
      { id: 'otherType', number: '4000', name: 'Income', type: 'Income', active: true },
      { id: 'inactive', number: '7003', name: 'Inactive', type: 'Expense', active: false },
    ] }) })
    // Second call posts merge
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })

    render(<AccountMergeButton sourceId="src" sourceType="Expense" onDone={() => {}} />)

  await user.click(screen.getByText('Merge'))
    // Wait for select to appear and ensure only eligible options are shown
  const sel = await screen.findByLabelText('Target account')
  // Pick the eligible target
  await user.selectOptions(sel, 'tgt')
  const mergeButtons = screen.getAllByRole('button', { name: 'Merge' })
  const innerMergeBtn = mergeButtons[mergeButtons.length - 1]
  await waitFor(() => expect(innerMergeBtn).not.toBeDisabled())
  await user.click(innerMergeBtn)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/api\/accounts\?includeInactive=1/)
    expect(mockFetch.mock.calls[1][0]).toBe('/api/accounts/merge')
    const body = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(body).toMatchObject({ sourceId: 'src', targetId: 'tgt' })
  })

  test('shows error if merge fails', async () => {
    const user = userEvent.setup()
    const { AccountMergeButton } = await import('@/components/AccountMergeButton')
    const mockFetch = (global as any).fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ accounts: [ { id: 'src', number: '7001', name: 'Src', type: 'Expense', active: true }, { id: 'tgt', number: '7002', name: 'Tgt', type: 'Expense', active: true } ] }) })
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: 'Accounts must be the same type to merge' }) })

  render(<AccountMergeButton sourceId="src" sourceType="Expense" />)
  await user.click(screen.getByText('Merge'))
  const sel = await screen.findByLabelText('Target account')
  await user.selectOptions(sel, 'tgt')
  const mergeButtons = screen.getAllByRole('button', { name: 'Merge' })
  const innerMergeBtn = mergeButtons[mergeButtons.length - 1]
  await waitFor(() => expect(innerMergeBtn).not.toBeDisabled())
  await user.click(innerMergeBtn)

    expect(await screen.findByText('Accounts must be the same type to merge')).toBeInTheDocument()
  })
})
