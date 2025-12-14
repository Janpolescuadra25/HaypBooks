import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ loading: false, has: () => true })
}))
import { PrintChecksButton } from '@/components/ReportActions'

// Minimal DOM helpers for download
const clickSpy = jest.fn()

describe('PrintChecksButton (non-ignored name)', () => {
  beforeEach(() => {
    jest.resetModules()

    // Mock fetch to return a PDF-like response with Content-Disposition
    global.fetch = jest.fn().mockResolvedValue(
      new Response(new Blob([new Uint8Array([0x25,0x50,0x44,0x46])], { type: 'application/pdf' }), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="checks-asof-2025-10-04_operating-checking-1234.pdf"' }
      })
    ) as any

    // Mock document.createElement('a') click flow
    const createEl = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tag: any) => {
      const el = createEl(tag)
      if (tag === 'a') {
        ;(el as any).click = clickSpy as any
      }
      return el as any
    })

    // Stub URL.createObjectURL / revoke
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock') as any
    global.URL.revokeObjectURL = jest.fn() as any
  })

  test('sends account in POST and downloads PDF', async () => {
    render(<PrintChecksButton accountName="Operating Checking - 1234" />)
    const btn = await screen.findByRole('button', { name: /print checks/i })
    fireEvent.click(btn)
    await waitFor(() => expect(clickSpy).toHaveBeenCalled())

    expect((global as any).fetch).toHaveBeenCalledWith(
      '/api/checks/print',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'Operating Checking - 1234' })
      })
    )
  })
})
