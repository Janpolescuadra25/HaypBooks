import { render, screen, fireEvent } from '@testing-library/react'
import EntityActivityPage from '@/app/activity/[entity]/page'

// Provide a controllable mock of next/navigation so useRouter/usePathname/useSearchParams work in tests
jest.mock('next/navigation', () => {
  let search = ''
  let pathname = '/activity/invoice'
  return {
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({
      replace: (href: string) => { const q = href.split('?')[1]; search = q || '' },
      push: (href: string) => { const q = href.split('?')[1]; search = q || '' },
    }),
    __setSearch: (q: string) => { search = q },
    __getSearch: () => search,
    __setPath: (p: string) => { pathname = p }
  }
})

describe('Activity filters announce via aria-live', () => {
  test('changing date inputs updates hidden polite region', async () => {
    // Render with a test entity
    const Page = (EntityActivityPage as any).default || (EntityActivityPage as any)
    render(<Page params={{ entity: 'invoice' }} />)
    const start = screen.getByLabelText('Start') as HTMLInputElement
    const end = screen.getByLabelText('End') as HTMLInputElement
    fireEvent.change(start, { target: { value: '2025-01-01' } })
    fireEvent.change(end, { target: { value: '2025-01-31' } })
    // Find the live region content indirectly via accessible name by text content
    const polite = await screen.findByText(/Start 2025-01-01\./i)
    expect(polite).toBeInTheDocument()
  })
})
