import CustomersPage from '@/app/customers/page'

// Render the Customers list directly under /sales/customers to keep the Sales sub-nav stable
export default function SalesCustomersPage() {
  return <CustomersPage />
}
