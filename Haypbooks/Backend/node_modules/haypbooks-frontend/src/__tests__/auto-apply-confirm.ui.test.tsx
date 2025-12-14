import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutoApplyCustomerCredits from '@/app/customers/[id]/auto-apply-client'
import AutoApplyVendorCredits from '@/app/vendors/[id]/auto-apply-client'

// Basic fetch stub helpers
function stubFetchFor(pathStartsWith: string, payload: any) {
  (global.fetch as any) = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const method = (init?.method || 'GET').toUpperCase()
    if (url.startsWith(pathStartsWith) && method === 'POST') {
      return {
        ok: true,
        json: async () => payload,
        status: 200,
      } as any
    }
    return { ok: true, json: async () => ({}) } as any
  })
}

describe('Auto-apply credits confirm dialog', () => {
  const originalFetch = global.fetch as any
  const originalConfirm = (global as any).confirm

  afterEach(() => {
    global.fetch = originalFetch
    // @ts-ignore
    global.confirm = originalConfirm
  })

  it('customer flow prompts before apply', async () => {
    // Preview response (dryRun)
    const preview = {
      ok: 2,
      totalApplied: 125.5,
      results: [
        { invoiceNumber: 'INV-1', creditNumber: 'CM-1', amount: 100 },
        { invoiceNumber: 'INV-2', creditNumber: 'CM-2', amount: 25.5 },
      ],
    }
    stubFetchFor('/api/customers/c1/credits/auto-apply', preview)

    const user = userEvent.setup()
    render(<AutoApplyCustomerCredits customerId="c1" canManage={true} />)

    // Run preview
    await user.click(screen.getByRole('button', { name: /preview auto-apply/i }))
    await screen.findByText(/Preview: 2 allocations totaling/i)

    // Spy on confirm and reject first
    // @ts-ignore
    global.confirm = jest.fn(() => false)

    const applyBtn = screen.getByRole('button', { name: /apply credits/i })
    await user.click(applyBtn)
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled()
    })

    // Now accept and ensure fetch is called again with non-dry-run
    ;(global.confirm as any) = jest.fn(() => true)

    // Replace fetch to observe second call
    const postCalls: any[] = []
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : init?.body
      if (url.startsWith('/api/customers/c1/credits/auto-apply') && (init?.method || 'POST').toUpperCase() === 'POST') {
        postCalls.push({ url, body })
        return { ok: true, json: async () => ({ ok: 2, totalApplied: 125.5 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)

    await user.click(applyBtn)
    await waitFor(() => {
      expect(postCalls.some(c => c.body && c.body.dryRun === false)).toBe(true)
    })
  })

  it('vendor flow prompts before apply', async () => {
    const preview = {
      ok: 1,
      totalApplied: 50,
      results: [
        { billNumber: 'B-1', creditNumber: 'VC-1', amount: 50 },
      ],
    }
    stubFetchFor('/api/vendors/v1/credits/auto-apply', preview)

    const user = userEvent.setup()
    render(<AutoApplyVendorCredits vendorId="v1" canManage={true} />)

    await user.click(screen.getByRole('button', { name: /preview auto-apply/i }))
    await screen.findByText(/Preview: 1 allocation totaling/i)

    // @ts-ignore
    global.confirm = jest.fn(() => true)

    const applyBtn = screen.getByRole('button', { name: /apply credits/i })

    const postCalls: any[] = []
    global.fetch = (jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const body = typeof init?.body === 'string' ? JSON.parse(init!.body as string) : init?.body
      if (url.startsWith('/api/vendors/v1/credits/auto-apply') && (init?.method || 'POST').toUpperCase() === 'POST') {
        postCalls.push({ url, body })
        return { ok: true, json: async () => ({ ok: 1, totalApplied: 50 }) } as any
      }
      return { ok: true, json: async () => ({}) } as any
    }) as any)

    await user.click(applyBtn)
    await waitFor(() => {
      expect(postCalls.some(c => c.body && c.body.dryRun === false)).toBe(true)
    })
  })
})
