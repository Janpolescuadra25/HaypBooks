import InvoicesPage from '@/app/invoices/page'

// Render the Invoices list directly under /sales/invoices to keep the Sales sub-nav stable
export default function SalesInvoicesPage() {
  return <InvoicesPage />
}
