import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewStep } from '@/app/onboarding/page'

test('renders review cards and edit buttons call onEdit', async () => {
  const onEdit = jest.fn()
  const snapshot = {
    business: { companyName: 'Acme Inc', businessType: 'Retail', industry: 'Ecommerce', address: 'Manila', businessEmail: 'hello@acme.com' },
    fiscal: { fiscalStart: 'Jan', accountingMethod: 'accrual' },
    tax: { tin: '123-456', filingFrequency: 'quarterly', taxRate: 12 },
    banking: { accounts: [{ id: 'a1' }] }
  }

  render(<ReviewStep snapshot={snapshot} onEdit={onEdit} />)

  expect(screen.getByText(/Configuration Complete/i)).toBeInTheDocument()
  expect(screen.getByText(/Company Identity/i)).toBeInTheDocument()
  expect(screen.getByText(/Accounting Profile/i)).toBeInTheDocument()
  expect(screen.getByText(/Tax Compliance/i)).toBeInTheDocument()
  expect(screen.getByText(/Products & Services/i)).toBeInTheDocument()
  expect(screen.getByText(/Branding/i)).toBeInTheDocument()
  expect(screen.getByText(/Banking Feeds/i)).toBeInTheDocument()

  // icons have accessible labels and are present
  expect(screen.getByLabelText('Company Identity icon')).toBeInTheDocument()
  expect(screen.getByLabelText('Products & Services icon')).toBeInTheDocument()
  expect(screen.getByLabelText('Accounting Profile icon')).toBeInTheDocument()
  expect(screen.getByLabelText('Tax Compliance icon')).toBeInTheDocument()
  expect(screen.getByLabelText('Branding icon')).toBeInTheDocument()
  expect(screen.getByLabelText('Banking Feeds icon')).toBeInTheDocument()

  // 'Add logo' CTA removed from branding card
  expect(screen.queryByText(/Add logo/i)).not.toBeInTheDocument()

  await userEvent.click(screen.getByLabelText('edit-company'))
  expect(onEdit).toHaveBeenCalledWith(0)
  await userEvent.click(screen.getByLabelText('edit-products'))
  expect(onEdit).toHaveBeenCalledWith(1)
  await userEvent.click(screen.getByLabelText('edit-fiscal'))
  expect(onEdit).toHaveBeenCalledWith(2)
  await userEvent.click(screen.getByLabelText('edit-tax'))
  expect(onEdit).toHaveBeenCalledWith(3)
  await userEvent.click(screen.getByLabelText('edit-branding'))
  expect(onEdit).toHaveBeenCalledWith(4)
  await userEvent.click(screen.getByLabelText('edit-banking'))
  expect(onEdit).toHaveBeenCalledWith(5)
})

test('cards are in the correct top-bar order', async () => {
  const onEdit = jest.fn()
  const snapshot = { business: {}, sells: {}, fiscal: {}, tax: {}, branding: {}, banking: {} }
  const { container } = render(<ReviewStep snapshot={snapshot} onEdit={onEdit} />)
  const headings = Array.from(container.querySelectorAll('h3')).map((h) => h.textContent?.trim())
  expect(headings).toEqual([
    'Company Identity',
    'Products & Services',
    'Accounting Profile',
    'Tax Compliance',
    'Branding',
    'Banking Feeds'
  ])
})

test('connect bank CTA is removed from review when no linked accounts', async () => {
  const onEdit = jest.fn()
  const snapshot = {
    banking: { accounts: [] }
  }
  render(<ReviewStep snapshot={snapshot} onEdit={onEdit} />)
  expect(screen.queryByLabelText('connect-banking')).not.toBeInTheDocument()
})
