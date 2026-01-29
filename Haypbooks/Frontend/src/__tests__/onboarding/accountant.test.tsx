import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import AccountantOnboarding from '../../app/onboarding/accountant/page'

jest.mock('../../lib/api-client', () => ({
  patch: jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({ status: 200 }),
}))

test('renders onboarding copy and submits form', async () => {
  render(<AccountantOnboarding />)

  expect(screen.getByRole('heading', { name: /welcome.*Accountant Workspace/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/Accountant Workspace name/i)).toBeInTheDocument()

  const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
  await act(async () => { await userEvent.type(input, 'Green Accounting') })

  // Trigger blur so the onBlur save runs and shows a toast (mocked)
  await act(async () => { await userEvent.tab() })

  const apiClient = require('../../lib/api-client')
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/onboarding/save', { step: 'accountant_firm', data: { firmName: 'Green Accounting' } }))

  const btn = screen.getByRole('button', { name: /Create Accountant Workspace/i })
  expect(btn).toBeEnabled()

  await act(async () => { await userEvent.click(btn) })

  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/onboarding/complete', { type: 'full', hub: 'ACCOUNTANT' }))
})