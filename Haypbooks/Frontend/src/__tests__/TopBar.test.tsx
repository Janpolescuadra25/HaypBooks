import { fireEvent, render, screen } from '@testing-library/react'
import TopBar from '../components/TopBar'

test('renders navigation tabs', () => {
  render(<TopBar companyCount={2} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)
  expect(screen.getByText(/PORTFOLIO/i)).toBeInTheDocument()
  expect(screen.getByText(/TASK REMINDER/i)).toBeInTheDocument()
  expect(screen.getByText(/RECONCILE ACCOUNTS/i)).toBeInTheDocument()
  expect(screen.getByText(/HAYPBOOKS/i)).toBeInTheDocument()
})

test('shows sign-out confirmation immediately when Log out is clicked', () => {
  render(<TopBar companyCount={2} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)

  // Open the demo user menu
  fireEvent.click(screen.getByRole('button', { name: /demo user/i }))
  expect(screen.getByText(/SESSION IDENTITY/i)).toBeInTheDocument()

  // Click log out
  fireEvent.click(screen.getByRole('button', { name: /log out/i }))

  // Confirm modal should appear immediately (not only after re-opening the menu)
  expect(screen.getByRole('dialog', { name: /confirm sign out/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
})
