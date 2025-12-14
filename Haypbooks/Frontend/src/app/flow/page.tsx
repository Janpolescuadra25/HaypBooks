import { redirect } from 'next/navigation'
export const metadata = { title: 'Workflow Overview' }

const SECTIONS = [
  {
    key: 'vendors',
    title: 'Vendors',
    actions: [
      { label: 'Enter bills', href: '/bills/new' },
      { label: 'Pay bills', href: '/bills' },
      { label: 'Manage sales tax', href: '/taxes' }
    ],
  },
  {
    key: 'customers',
    title: 'Customers',
    actions: [
      { label: 'Create estimates', href: '/estimates/new' },
      { label: 'Create invoices', href: '/invoices/new' },
      { label: 'Receive payments', href: '/payments/new' },
      { label: 'Create sales receipts', href: '/sales-receipts/new' }
    ],
  },
  {
    key: 'company',
    title: 'Company',
    actions: [
      { label: 'Chart of accounts', href: '/chart-of-accounts' },
      { label: 'Manage users', href: '/users' },
      { label: 'Products & services', href: '/sales/products-services' },
      { label: 'Order checks', href: '/supplies' }
    ],
  },
  {
    key: 'banking',
    title: 'Banking',
    actions: [
      { label: 'Record deposits', href: '/bank-transactions/new-deposit' },
      { label: 'Reconcile', href: '/reconciliation' },
      { label: 'Returns & refunds', href: '/refunds' }
    ],
  },
]

export default function FlowPage(){
  redirect('/dashboard/flow')
}
