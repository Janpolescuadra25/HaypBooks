import { render, waitFor } from '@testing-library/react'
import CompanyHub from '../components/companies/CompanyHub'

jest.mock('../hooks/useViewportZoom', () => ({
  __esModule: true,
  default: () => ({ isCompact: false, isWide: true }),
}))

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    if (String(url).includes('filter=owned')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1', name: 'Owned Co', plan: 'Pro' }]) })
    }
    if (String(url).includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockRestore?.()
})

test('expands container edge-to-edge when visual viewport indicates wide', async () => {
  const { container } = render(<CompanyHub />)
  await waitFor(() => expect(container.querySelector('main > div')).toBeTruthy())
  const mainDiv = container.querySelector('main > div')
  expect(mainDiv?.classList.contains('w-full')).toBe(true)

  // ensure the inner white "portfolio" container is edge-to-edge but retains rounded corners
  const whiteContainer = mainDiv?.querySelector('.relative.overflow-visible.bg-white') as HTMLElement | null
  expect(whiteContainer).toBeTruthy()
  expect(whiteContainer?.className.includes('rounded-[64px]')).toBe(true)
  // when wide, the container should have marginal horizontal insets so corners are visible
  expect(whiteContainer?.className.includes('mx-4')).toBe(true)
})
