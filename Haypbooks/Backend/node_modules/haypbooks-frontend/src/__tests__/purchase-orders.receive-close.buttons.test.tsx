/** @jest-environment jsdom */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClosePOButton } from '@/app/purchase-orders/po-receive-client'
import * as navigation from '@/utils/navigation'

describe('Purchase Order Receive/Close buttons (client)', () => {
  const originalFetch = global.fetch
  let fetchSpy: jest.Mock
  let reloadSpy: jest.SpyInstance

  beforeEach(() => {
    fetchSpy = jest.fn(async (input: any, init?: any) => {
      const url = String(input)
      if (url.includes('/api/purchase-orders/') && url.endsWith('/close')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }
      return typeof originalFetch === 'function' ? originalFetch(input, init) : new Response('Not Found', { status: 404 })
    }) as any
    Object.defineProperty(global, 'fetch', { value: fetchSpy, configurable: true, writable: true })
    // Mock navigation.reloadPage which these components call
    reloadSpy = jest.spyOn(navigation, 'reloadPage').mockImplementation(() => {})
  })

  afterEach(() => {
    Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true })
    // Restore reload spy
    if (reloadSpy) reloadSpy.mockRestore()
  })

  test('Close button posts and reloads', async () => {
    render(<ClosePOButton id="po1" />)
    const btn = screen.getByRole('button', { name: /close/i })
    expect(btn).toBeEnabled()
    fireEvent.click(btn)
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/purchase-orders/po1/close', expect.objectContaining({ method: 'POST' }))
  expect(reloadSpy).toHaveBeenCalled()
    })
  })
})
