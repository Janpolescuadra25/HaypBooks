import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Journals list page', () => {
  test('renders rows from API', async () => {
    jest.resetModules()
    const mockData = { journals: [
      { id: 'je_1', number: 'JE-1001', memo: 'Voiding entry', date: '2025-01-15', totals: { debit: 100, credit: 100 } },
      { id: 'je_2', number: 'JE-1002', memo: '', date: '2025-01-16', totals: { debit: 50, credit: 50 } },
    ] }
  const origFetch = global.fetch
  jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    // Mock client-only components that depend on Next app router context
    // Mock Amount to avoid client hook usage in this isolated render test
    jest.doMock('@/components/Amount', () => ({ __esModule: true, default: ({ value }: any) => <span>{Number(value).toLocaleString(undefined,{style:'currency',currency:'USD'})}</span> }))
    jest.doMock('@/components/BackBar', () => ({ __esModule: true, default: ({ label }: any) => <div data-testid="backbar">{label || 'Back'}</div> }))
    jest.doMock('@/components/ReportActions', () => ({ __esModule: true, ExportCsvButton: () => <div data-testid="export">Export</div>, PrintButton: () => <div data-testid="print">Print</div> }))
    jest.doMock('@/components/Notice', () => ({ __esModule: true, default: () => <div data-testid="notice" /> }))
  jest.doMock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))
    ;(global as any).fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(mockData), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    // Import after mocking fetch
  const Page = (await import('@/app/journal/page')).default as any
  const el = await Page({})
  const { container } = render(el)
  expect(container.textContent).toContain('JE-1001')
  expect(container.textContent).toContain('JE-1002')
    ;(global as any).fetch = origFetch
  })
})
