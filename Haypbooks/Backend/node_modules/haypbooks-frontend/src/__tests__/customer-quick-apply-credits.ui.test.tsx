import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

describe('QuickApplyCustomerCredits', () => {
  // Avoid resetting modules between tests to prevent multiple React instances,
  // which can cause "Invalid hook call" errors in React 18.
  // If isolation is needed for specific modules, prefer jest.isolateModules.

  test('renders when there are open invoices and credits and respects canManage=false', async () => {
    // Mock fetch for invoices and credit memos
    const mockFetch = jest.spyOn(global, 'fetch' as any).mockImplementation((url: any) => {
      const href = String(url)
      if (href.startsWith('/api/invoices')) {
        return Promise.resolve(new Response(JSON.stringify({ invoices: [
          { id: 'inv_1', number: 'INV-1001', customerId: 'c_1', status: 'open', total: 300, balance: 200 },
        ] })))
      }
      if (href.startsWith('/api/credit-memos')) {
        return Promise.resolve(new Response(JSON.stringify({ creditMemos: [
          { id: 'cm_1', number: 'CM-9001', remaining: 150 },
        ] })))
      }
      if (href.includes('/apply-credit')) {
        return Promise.resolve(new Response(JSON.stringify({ ok: true })))
      }
      return Promise.resolve(new Response(JSON.stringify({})))
    })

    const Mod = await import('@/app/customers/[id]/quick-apply-client')
    const Comp = Mod.default as any
    render(<Comp customerId="c_1" canManage={false} />)

    // Wait for the selects to appear
    await waitFor(() => expect(screen.getByLabelText('Invoice')).toBeInTheDocument())
    expect(screen.getByLabelText('Credit')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    // Controls disabled when canManage=false
    expect(screen.getByLabelText('Invoice')).toBeDisabled()
    expect(screen.getByLabelText('Credit')).toBeDisabled()
    expect(screen.getByLabelText('Amount')).toBeDisabled()
    const applyBtn = screen.getByRole('button', { name: /apply/i })
    expect(applyBtn).toBeDisabled()

    mockFetch.mockRestore()
  })
})
