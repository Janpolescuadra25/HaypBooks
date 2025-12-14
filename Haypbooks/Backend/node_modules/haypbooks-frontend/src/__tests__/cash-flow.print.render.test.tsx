import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Cash Flow print page', () => {
  const origFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    ;(global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/reports/cash-flow')) {
        const u = new URL(url)
        const compare = u.searchParams.get('compare') === '1'
        const base: any = {
          period: 'MTD',
          sections: { operations: 2000, investing: -800, financing: -300 },
          netChange: 900,
        }
        if (compare) base.prev = { sections: { operations: 1800, investing: -900, financing: -400 }, netChange: 500 }
        return Promise.resolve(new Response(JSON.stringify(base), { status: 200 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }) as any
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>${'{'}Number(value).toFixed(2){'}'}</span> }))
  })

  afterEach(() => {
    ;(global as any).fetch = origFetch as any
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders caption and Net Change in Cash row', async () => {
    const Page = (await import('@/app/reports/cash-flow/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15' } })
    render(el)
    expect(screen.getByText('Cash Flow')).toBeInTheDocument()
    expect(screen.getByText('September 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('Net Change in Cash')).toBeInTheDocument()
  })

  test('renders compare columns when compare=1', async () => {
    const Page = (await import('@/app/reports/cash-flow/print/page')).default as any
    const el = await Page({ searchParams: { end: '2025-09-15', compare: '1' } })
    render(el)
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})
