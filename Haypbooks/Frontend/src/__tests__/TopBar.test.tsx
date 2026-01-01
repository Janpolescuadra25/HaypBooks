import { render, screen } from '@testing-library/react'
import TopBar from '../components/TopBar'

test('renders navigation tabs', () => {
  render(<TopBar companyCount={2} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)
  expect(screen.getByText(/PORTFOLIO/i)).toBeInTheDocument()
  expect(screen.getByText(/TASK REMINDER/i)).toBeInTheDocument()
  expect(screen.getByText(/RECONCILE ACCOUNTS/i)).toBeInTheDocument()
  expect(screen.getByText(/HAYPBOOKS/i)).toBeInTheDocument()
})
