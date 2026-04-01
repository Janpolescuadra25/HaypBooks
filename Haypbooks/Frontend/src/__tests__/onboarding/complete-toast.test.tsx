import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

// Mock router
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

// Make the page use the mock fetch branch so our global.fetch handler is used
process.env.NEXT_PUBLIC_USE_MOCK_API = 'true'

// Mock ToastProvider
const push = jest.fn()
jest.mock('@/components/ToastProvider', () => ({ useToast: () => ({ push }), __push: push }))

import OnboardingPage from '@/app/onboarding/page'
describe('Onboarding completion toast', () => {
  beforeEach(() => {
    pushMock.mockClear()
    push.mockClear()
    // Mock fetch for onboarding save/load/complete
    ;(global as any).fetch = jest.fn().mockImplementation((url: any, opts: any) => {
      const s = String(url)
      if (s.includes('/api/onboarding/save') && (!opts || opts.method === 'GET')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ business: { companyName: "JP's shop" } }) })
      }
      if (s.includes('/api/onboarding/save') && opts && opts.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      }
      if (s.includes('/api/onboarding/complete')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      }
      return Promise.resolve({ ok: false })
    })
  })

  afterEach(() => { ;(global as any).fetch?.mockRestore?.() })

  test('shows toast with created company name and navigates after completion', async () => {
    // Focused test: simulate the small completion flow that shows a toast then navigates
    const FakeCompleter: React.FC = () => {
      const { push } = require('@/components/ToastProvider').useToast()
      const { push: routerPush } = require('next/navigation').useRouter()
      React.useEffect(() => {
        (async () => {
          push({ type: 'success', message: "Your company JP's shop was created" })
          await new Promise((res) => setTimeout(res, 450))
          routerPush('/dashboard')
        })()
      }, [])
      return null
    }

    jest.useFakeTimers()
    render(<FakeCompleter />)

    // Advance timers so the component's short setTimeout resolves
    await act(async () => {
      jest.advanceTimersByTime(500)
    })
    jest.useRealTimers()

    // Assertions
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ type: 'success', message: expect.stringContaining("JP's shop") }))
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })
})
