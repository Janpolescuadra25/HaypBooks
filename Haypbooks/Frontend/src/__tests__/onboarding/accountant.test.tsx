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

  expect(screen.getByRole('heading', { name: /welcome — let’s set up your firm/i })).toBeInTheDocument()
  expect(screen.getByText(/let’s start by naming your firm/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/firm name/i)).toBeInTheDocument()

  const input = screen.getByPlaceholderText(/your firm's name/i)
  await act(async () => { await userEvent.type(input, 'Green Accounting') })

  const btn = screen.getByRole('button', { name: /create firm/i })
  expect(btn).toBeEnabled()

  await act(async () => { await userEvent.click(btn) })

  const apiClient = require('../../lib/api-client')
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/onboarding/complete', { type: 'full', hub: 'ACCOUNTANT' }))
})