export default function Features() {
  const features = [
    {
      icon: '📊',
      title: 'Complete Accounting Suite',
      description: 'Accounts Receivable, Accounts Payable, General Ledger, Bank Reconciliation, and Financial Reporting - everything you need in one platform.'
    },
    {
      icon: '🧾',
      title: 'Invoicing & Billing',
      description: 'Create professional invoices, track payments, manage recurring billing, and automate payment reminders. BIR-compliant receipts included.'
    },
    {
      icon: '📦',
      title: 'Inventory Management',
      description: 'Track stock levels, manage multiple warehouses, set reorder points, and get real-time inventory valuation reports.'
    },
    {
      icon: '💰',
      title: 'Tax Compliance',
      description: 'Built-in VAT/GST calculations, automatic tax reports, 1099 filing support, and BIR form generation for Philippine businesses.'
    },
    {
      icon: '📈',
      title: 'Financial Reports',
      description: 'Balance Sheet, Profit & Loss, Cash Flow, Aging Reports, Budget vs Actual - all reports export to CSV and PDF.'
    },
    {
      icon: '🏦',
      title: 'Bank Integration',
      description: 'Connect your bank accounts, import transactions automatically, match payments, and reconcile accounts in minutes.'
    },
    {
      icon: '👥',
      title: 'Multi-User Access',
      description: 'Add accountants, bookkeepers, and team members with role-based permissions. Collaborate securely in real-time.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level encryption, audit logs, two-factor authentication, and automatic backups keep your data safe and compliant.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-xl text-gray-600">
            All the features of enterprise accounting software, without the enterprise price tag
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
