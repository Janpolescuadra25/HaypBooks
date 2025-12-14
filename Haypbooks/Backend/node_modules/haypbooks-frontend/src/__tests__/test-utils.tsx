import React from 'react'

// Sets up common mocks for report page tests to avoid App Router hooks and external fetch origins.
export function setupReportPageTest() {
  const origFetch: any = (global as any).fetch
  const mockFetch = jest.fn()
  ;(global as any).fetch = mockFetch

  // Use doMock so we can call this from within a test before dynamic imports
  jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
  jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
  jest.doMock('@/components/ReportHeader', () => ({ ReportHeader: () => null }))

  const cleanup = () => {
    ;(global as any).fetch = origFetch
    jest.resetModules()
    jest.clearAllMocks()
  }

  return { mockFetch, cleanup }
}
