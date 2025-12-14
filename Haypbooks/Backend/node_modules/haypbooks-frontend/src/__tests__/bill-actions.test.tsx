/** @jest-environment jsdom */
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import BillActions from '@/components/BillActions'

// Mock next/navigation router
jest.mock('next/navigation', () => {
  const push = jest.fn()
  const refresh = jest.fn()
  return {
    useRouter: () => ({ push, refresh }),
  }
})

describe('BillActions', () => {
  const originalFetch = global.fetch as any
  const originalConfirm = global.confirm as any
  let pushes: string[] = []

  beforeEach(() => {
    pushes = []
    // Mock fetch for DELETE
    global.fetch = jest.fn(async (url: any, init: any) => {
      if (String(url).includes('/api/bills/') && init?.method === 'DELETE') {
        return { ok: true, json: async () => ({ ok: true }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    })
    // Mock confirm to true by default
    global.confirm = jest.fn(() => true)
    // Capture pushes via replacing useRouter mock's return
    const mod = require('next/navigation')
    mod.useRouter = () => ({
      push: (path: string) => { pushes.push(path) },
      refresh: jest.fn(),
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    global.confirm = originalConfirm
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('Edit navigates to /bills/:id/edit', () => {
    render(<BillActions id="bill_123" />)
    const editBtn = screen.getByRole('button', { name: /edit bill/i })
    fireEvent.click(editBtn)
    expect(pushes[0]).toBe('/bills/bill_123/edit')
  })

  test('Delete asks for confirm and then deletes, navigating to /bills', async () => {
    render(<BillActions id="bill_456" />)
    const delBtn = screen.getByRole('button', { name: /delete bill/i })
    fireEvent.click(delBtn)
    await waitFor(() => {
      expect(pushes.includes('/bills')).toBeTruthy()
    })
  })

  test('Delete cancels when user denies confirm', async () => {
    (global.confirm as jest.Mock).mockReturnValueOnce(false)
    render(<BillActions id="bill_789" />)
    const delBtn = screen.getByRole('button', { name: /delete bill/i })
    fireEvent.click(delBtn)
    await new Promise((r) => setTimeout(r, 50))
    expect(pushes.length).toBe(0)
  })
})
