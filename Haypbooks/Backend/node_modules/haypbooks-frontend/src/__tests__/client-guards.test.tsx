/** @jest-environment jsdom */
import React from 'react'
import { render, waitFor } from '@testing-library/react'

// Pages under test
import NewExpensePage from '@/app/expenses/new/page'
import NewJournalPage from '@/app/journal/new/page'
import NewBillPage from '@/app/bills/new/page'

// Base mock for next/navigation; individual tests will override useRouter to capture replace()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}))

describe('Client-side RBAC guards on "New" pages', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    // default: no permissions
    global.fetch = jest.fn(async (url: any) => {
      const u = String(url)
      if (u.includes('/api/user/profile')) {
        return { ok: true, json: async () => ({ permissions: [] }) } as any
      }
      if (u.includes('/api/accounts')) {
        return { ok: true, json: async () => ({ accounts: [] }) } as any
      }
      if (u.includes('/api/customers')) {
        return { ok: true, json: async () => ({ customers: [] }) } as any
      }
      if (u.includes('/api/vendors')) {
        return { ok: true, json: async () => ({ vendors: [] }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  test('unauthorized user is redirected from New Expense', async () => {
    const replaces: string[] = []
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)

    render(<NewExpensePage />)
    await waitFor(() => {
      expect(replaces.includes('/expenses')).toBeTruthy()
    })
  })

  test('unauthorized user is redirected from New Journal', async () => {
    const replaces: string[] = []
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)

    render(<NewJournalPage />)
    await waitFor(() => {
      expect(replaces.includes('/journal')).toBeTruthy()
    }, { timeout: 3000 })
  })

  test('unauthorized user is redirected from New Bill', async () => {
    const replaces: string[] = []
    const nav = require('next/navigation')
    jest.spyOn(nav, 'useRouter').mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      replace: (path: string) => { replaces.push(path) },
    } as any)

    render(<NewBillPage />)
    await waitFor(() => {
      expect(replaces.includes('/bills')).toBeTruthy()
    }, { timeout: 3000 })
  })
})
