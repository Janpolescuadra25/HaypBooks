import LandingHeader from '@/components/landing/LandingHeader'
import { BookOpen, BarChart3, Building2, CreditCard, Receipt, PiggyBank, FileText, Users, ShieldCheck, Landmark } from 'lucide-react'

export const metadata = {
  title: 'Features — HaypBooks',
  description: 'Everything you need to run your Philippine business finances — invoicing, accounting, banking, payroll, and more.',
}

const FEATURE_SECTIONS = [
  {
    title: 'Accounting & Bookkeeping',
    description: 'Full double-entry accounting designed for Philippine businesses.',
    icon: BookOpen,
    features: [
      'Chart of Accounts with BIR-aligned categories',
      'General Journal & General Ledger',
      'Adjusting & closing entries',
      'Multi-currency support',
      'Recurring journal entries',
    ],
  },
  {
    title: 'Financial Reports',
    description: 'Accurate, real-time financial statements at your fingertips.',
    icon: BarChart3,
    features: [
      'Profit & Loss (Income Statement)',
      'Balance Sheet',
      'Cash Flow Statement',
      'Trial Balance',
      'Budget vs Actual analysis',
      'Custom report builder',
    ],
  },
  {
    title: 'Invoicing & Billing',
    description: 'Create professional invoices and get paid faster.',
    icon: Receipt,
    features: [
      'Customizable invoice templates',
      'Recurring invoices & auto-send',
      'Online payment links',
      'Credit notes & refunds',
      'Aging reports & collection tools',
    ],
  },
  {
    title: 'Accounts Payable',
    description: 'Track vendor bills, schedule payments, and stay in control.',
    icon: CreditCard,
    features: [
      'Bill entry & approval workflows',
      'Vendor credit management',
      'Payment scheduling',
      'Purchase orders',
      'AP aging & cash planning',
    ],
  },
  {
    title: 'Banking & Reconciliation',
    description: 'Connect bank accounts and reconcile with confidence.',
    icon: Landmark,
    features: [
      'Bank feed import (CSV & OFX)',
      'Automated transaction matching',
      'Multi-account dashboard',
      'Credit card tracking',
      'Check register',
    ],
  },
  {
    title: 'Payroll & Tax',
    description: 'Philippine-compliant payroll with automatic tax computation.',
    icon: PiggyBank,
    features: [
      'SSS, PhilHealth, Pag-IBIG deductions',
      'Withholding tax computation',
      'Payslip generation',
      '13th month pay tracking',
      'BIR form generation (2316, 1601-C, 1604-CF)',
    ],
  },
  {
    title: 'BIR Compliance',
    description: 'Built-in tools for Philippine tax filing and reporting.',
    icon: FileText,
    features: [
      'BIR Form 2307 (Certificates)',
      'BIR Form 2550M/Q (VAT returns)',
      'Sales & Purchase books',
      'Quarterly Income Tax returns',
      'CAS/CRS-ready output',
    ],
  },
  {
    title: 'Multi-Company & Teams',
    description: 'Manage multiple businesses with role-based access.',
    icon: Building2,
    features: [
      'Unlimited company profiles',
      'Role-based permissions (Admin, Manager, Clerk, Viewer)',
      'Audit trail & activity logs',
      'Team invitations',
      'Per-company dashboards',
    ],
  },
  {
    title: 'Practice Hub for Accountants',
    description: 'A dedicated workspace for bookkeepers managing client portfolios.',
    icon: Users,
    features: [
      'Client list & onboarding',
      'Work queue & deadlines',
      'Cross-client reporting',
      'Engagement management',
      'Accountant-branded experience',
    ],
  },
  {
    title: 'Security & Reliability',
    description: 'Enterprise-grade security for your financial data.',
    icon: ShieldCheck,
    features: [
      'Bank-level encryption (AES-256)',
      'Row-level data isolation',
      'Daily encrypted backups',
      'Two-factor authentication',
      'SOC 2 compliance roadmap',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 bg-white">
        {/* Hero */}
        <section className="text-center px-6 py-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Everything your business<br />needs in one place
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            From daily bookkeeping to BIR compliance — HaypBooks covers the full financial lifecycle for Philippine businesses.
          </p>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 gap-10">
            {FEATURE_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.title} className="rounded-3xl border border-slate-200 p-8 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}
