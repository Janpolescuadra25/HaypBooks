import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TopBar from '../components/TopBar'
import { authService } from '@/services/auth.service'

jest.mock('@/services/auth.service')

beforeEach(() => {
  ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Real User', email: 'real@user.test', role: 'owner' })
})

test('renders navigation tabs', async () => {
  render(<TopBar companyCount={2} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)
  expect(screen.getByText(/PORTFOLIO/i)).toBeInTheDocument()
  expect(screen.getByText(/TASK REMINDER/i)).toBeInTheDocument()
  expect(screen.getByText(/RECONCILE ACCOUNTS/i)).toBeInTheDocument()
  expect(screen.getByText(/HAYPBOOKS/i)).toBeInTheDocument()
  // Ensure user name is shown after fetch
  await waitFor(() => expect(screen.getByText(/Real User/i)).toBeInTheDocument())
})

test('shows sign-out confirmation immediately when Log out is clicked', async () => {
  render(<TopBar companyCount={2} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)

  // Open the user menu (wait for name to appear)
  await waitFor(() => expect(screen.getByText(/Real User/i)).toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: /real user/i }))
  expect(screen.getByText(/SESSION IDENTITY/i)).toBeInTheDocument()

  // Click log out
  fireEvent.click(screen.getByRole('button', { name: /log out/i }))

  // Confirm modal should appear immediately (not only after re-opening the menu)
  expect(screen.getByRole('dialog', { name: /confirm sign out/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
})
