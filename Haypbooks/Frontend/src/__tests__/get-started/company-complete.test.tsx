import { render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CompanyCompletePage from '@/app/get-started/complete/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Company Complete Page', () => {
  const mockReplace = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    mockReplace.mockClear()
    global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as any
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('redirects to hub when the user is not authenticated', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false } as any)
    render(<CompanyCompletePage />)

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/hub'))
  })

  it('redirects to hub with companyId when the user has a company', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ companies: [{ id: 'company-123' }] }),
    } as any)
    render(<CompanyCompletePage />)

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/hub?companyId=company-123'))
  })
})
