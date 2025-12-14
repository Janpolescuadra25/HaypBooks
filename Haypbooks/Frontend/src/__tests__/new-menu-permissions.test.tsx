/** @jest-environment jsdom */
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import NewMenu from '@/components/NewMenu'
import { clearProfileCache } from '@/lib/profile-cache'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() })
}))

describe('NewMenu permission visibility', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    clearProfileCache()
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  test('shows no items when user has no write permissions', async () => {
    global.fetch = jest.fn(async (url: any) => {
      if (String(url).includes('/api/user/profile')) {
        return { ok: true, json: async () => ({ permissions: ['reports:read'] }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    })

    render(<NewMenu />)
    fireEvent.click(screen.getByRole('button', { name: /new/i }))
    await waitFor(() => {
      expect(screen.getByText(/no create permissions/i)).toBeInTheDocument()
    })
  })

  test('shows relevant items when user has multiple create permissions', async () => {
    global.fetch = jest.fn(async (url: any) => {
      if (String(url).includes('/api/user/profile')) {
        return { ok: true, json: async () => ({ permissions: ['invoices:write','journal:write','customers:write'] }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    })

    render(<NewMenu />)
    fireEvent.click(screen.getByRole('button', { name: /new/i }))
    await waitFor(() => {
  expect(screen.getByRole('menuitem', { name: /invoice/i })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: /expense/i })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: /customer/i })).toBeInTheDocument()
      // Bill should be absent
      expect(screen.queryByRole('menuitem', { name: /bill/i })).toBeNull()
    })
  })
})
