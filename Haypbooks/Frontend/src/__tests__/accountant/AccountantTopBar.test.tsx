import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import AccountantTopBar from '../../components/accountant/AccountantTopBar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    logout: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'u_demo', name: 'Acct User', email: 'acct@haypbooks.test', role: 'accountant' }),
  },
}))

test('renders accountant top bar with tabs and no invite button', async () => {
  const onSwitchToOwner = jest.fn()
  render(<AccountantTopBar onSwitchToOwner={onSwitchToOwner} />)

  // Tabs
  const clientsBtns = screen.getAllByRole('button', { name: /clients/i })
  expect(clientsBtns.length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByRole('button', { name: /invitations/i }).length).toBeGreaterThanOrEqual(1)

  // Invite button should not be present in top bar
  expect(screen.queryByRole('button', { name: /invite client/i })).toBeNull()

  // User menu and switch option
  const userLabel = screen.getByText(/demo user/i)
  const userBtn = userLabel.closest('button') as HTMLElement
  await act(async () => { await userEvent.click(userBtn) })
  const switchBtn = screen.getByRole('button', { name: /switch hub/i })
  await act(async () => { await userEvent.click(switchBtn) })
  expect(onSwitchToOwner).toHaveBeenCalled()
})