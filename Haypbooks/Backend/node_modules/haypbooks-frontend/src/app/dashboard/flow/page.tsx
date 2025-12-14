import DashboardTopBar from '@/components/DashboardTopBar'

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

export default function DashboardFlowPage(){
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <DashboardTopBar />
      </div>
      <div className="glass-card bar-master-frame pt-2 pb-5 px-4">
        <h1 className="text-2xl font-semibold mb-4">Get things done</h1>
        <p className="text-sm text-slate-600 mb-6">Quick access to common tasks grouped by area. Use this flow view to jump directly into recording activity.</p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map(sec => (
            <section key={sec.key} className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 mb-3">{sec.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {sec.actions.map(a => (
                  <a key={a.label} href={a.href} className="flex flex-col items-start gap-1 rounded border p-2 hover:bg-slate-50">
                    <span className="text-xs font-medium text-slate-700">{a.label}</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
