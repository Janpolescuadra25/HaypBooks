import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CloseWorkflowPage from '@/app/(owner)/accounting/close-workflow/page'
import { useCompanyId } from '@/hooks/useCompanyId'
import apiClient from '@/lib/api-client'

jest.mock('@/hooks/useCompanyId')
jest.mock('@/lib/api-client')

describe('CloseWorkflowPage', () => {
  beforeEach(() => {
    ;(useCompanyId as jest.Mock).mockReturnValue({ companyId: 'c1', loading: false, error: null })
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { steps: [
      { id: 'coa', name: 'Chart of Accounts', status: 'Completed', description: 'OK', action: { type: 'go', label: 'Go to COA', link: '/accounting/core-accounting/chart-of-accounts' }},
      { id: 'journal', name: 'Journal Entries', status: 'Pending', description: 'No posted entries', action: { type: 'go', label: 'Go to Journal', link: '/accounting/core-accounting/journal-entries' }},
    ] } })
  })

  it('renders workflow steps', async () => {
    render(<CloseWorkflowPage />)
    expect(screen.getByText(/Close Workflow/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Chart of Accounts')).toBeInTheDocument()
      expect(screen.getByText('Journal Entries')).toBeInTheDocument()
    })
  })
})
