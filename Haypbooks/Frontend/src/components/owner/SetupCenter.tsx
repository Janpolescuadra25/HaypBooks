'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCompanyId } from '@/hooks/useCompanyId'
import { onboardingService } from '@/services/onboarding.service'

type SetupTask = {
  id: string
  title: string
  description: string
  path: string
  required?: boolean
}

type SetupPhase = {
  id: string
  title: string
  tasks: SetupTask[]
}

const SETUP_PHASES: SetupPhase[] = [
  {
    id: 'phase_1',
    title: 'Account Setup (Quick Setup)',
    tasks: [
      { id: 'business_profile', title: 'Business Profile', description: 'Enter company name and address', path: '/settings/company', required: true },
      { id: 'business', title: 'Account Creation', description: 'Create user account', path: '/onboarding', required: true },
      { id: 'company', title: 'Company Information', description: 'Set business identity', path: '/onboarding', required: true },
      { id: 'region', title: 'Region Selection', description: 'Set country/timezone/currency', path: '/onboarding', required: true },
      { id: 'fiscal', title: 'Currency & Fiscal Year', description: 'Set fiscal settings', path: '/onboarding', required: true },
      { id: 'coa', title: 'Chart of Accounts', description: 'Choose COA template or import', path: '/accounting/core-accounting/chart-of-accounts', required: true },
      { id: 'coa_seed', title: 'Seed Default Accounts', description: 'Initialize standard chart of accounts', path: '/home/setup-center', required: true },
      { id: 'bank', title: 'First Bank Account', description: 'Configure first bank account', path: '/banking/accounts', required: true },
      { id: 'tax', title: 'Tax Registration', description: 'Capture tax IDs', path: '/settings/tax', required: true },
      { id: 'review', title: 'Review & Confirm', description: 'Finalize quick setup', path: '/onboarding/review', required: true },
    ],
  },
  {
    id: 'phase_2',
    title: 'Setup Center - Account Setup',
    tasks: [
      { id: 'profile_security', title: 'Profile & Security', description: 'Configure base profiles and security', path: '/settings/profile' },
      { id: 'company_profile', title: 'Company Profile', description: 'Edit company address and legal details', path: '/settings/company' },
      { id: 'branding', title: 'Logo & Branding', description: 'Customize brand settings', path: '/settings/branding' },
      { id: 'notifications', title: 'Notifications & Alerts', description: 'Configure alert and notification preferences', path: '/settings/notifications' },
      { id: 'business_hours', title: 'Business Hours', description: 'Set operating hours and holidays', path: '/settings/business-hours' },
    ],
  },
  {
    id: 'phase_3',
    title: 'Setup Center - Financial Setup',
    tasks: [
      { id: 'coa_custom', title: 'Customize Chart of Accounts', description: 'Configure custom COA and mapping', path: '/accounting/core-accounting/chart-of-accounts', required: true },
      { id: 'opening_balances', title: 'Opening Balances', description: 'Enter opening balances for accounts', path: '/accounting/opening-balances' },
      { id: 'revenue_settings', title: 'Revenue & Invoicing', description: 'Configure invoice numbering and revenue preferences', path: '/accounting/revenue' },
      { id: 'tax_setup', title: 'Tax Rates', description: 'Set up VAT/GST and other tax rates', path: '/settings/tax' },
    ],
  },
  {
    id: 'phase_4',
    title: 'Setup Center - Banking Setup',
    tasks: [
      { id: 'bank_feeds', title: 'Connect Bank Feeds', description: 'Enable bank connection and reconciliation', path: '/banking/connections', required: true },
      { id: 'transaction_rules', title: 'Transaction Rules', description: 'Set auto-categorization rules for bank records', path: '/banking/rules' },
      { id: 'bank_reconciliation', title: 'Bank Reconciliation', description: 'Reconcile bank balances and transactions', path: '/banking/reconciliation' },
      { id: 'payouts', title: 'Payout Accounts', description: 'Configure disbursement accounts', path: '/banking/payouts' },
    ],
  },
  {
    id: 'phase_5',
    title: 'Setup Center - Sales & Customers',
    tasks: [
      { id: 'customers', title: 'Customers', description: 'Add key customers and terms', path: '/sales/customers', required: true },
      { id: 'products', title: 'Products & Services', description: 'Define products/services for sales', path: '/sales/items' },
      { id: 'prices', title: 'Price Lists', description: 'Configure pricing and discounts', path: '/sales/pricing' },
      { id: 'invoicing', title: 'Invoice Templates', description: 'Set up invoice templates and defaults', path: '/sales/invoices' },
    ],
  },
  {
    id: 'phase_6',
    title: 'Setup Center - Expenses & Vendors',
    tasks: [
      { id: 'vendors', title: 'Vendors', description: 'Add primary vendors and purchase terms', path: '/purchases/vendors' },
      { id: 'items', title: 'Expense Items', description: 'Configure expense categories and items', path: '/purchases/items' },
      { id: 'bills', title: 'Bills Setup', description: 'Set up bill entry preferences and approval', path: '/purchases/bills' },
      { id: 'payables', title: 'Accounts Payable', description: 'Configure payable workflows', path: '/ap/workflows' },
    ],
  },
  {
    id: 'phase_7',
    title: 'Setup Center - Payroll and HR',
    tasks: [
      { id: 'employees', title: 'Employees', description: 'Add employees and roles', path: '/payroll/employees' },
      { id: 'payrates', title: 'Pay Rates', description: 'Define compensation structures', path: '/payroll/rates' },
      { id: 'tax_withholding', title: 'Payroll Taxes', description: 'Configure withholding and benefits', path: '/payroll/taxes' },
      { id: 'payslips', title: 'Payslips', description: 'Create payslip templates', path: '/payroll/payslips' },
    ],
  },
  {
    id: 'phase_8',
    title: 'Setup Center - Reporting & Analytics',
    tasks: [
      { id: 'financial_reports', title: 'Financial Reports', description: 'Generate key financial reports', path: '/reports/financial' },
      { id: 'custom_reports', title: 'Custom Reports', description: 'Build custom analytics views', path: '/reports/custom' },
      { id: 'dashboards', title: 'Dashboard', description: 'Configure dashboard widgets and alerts', path: '/dashboard' },
    ],
  },
  {
    id: 'phase_9',
    title: 'Setup Center - Integrations',
    tasks: [
      { id: 'apis', title: 'API & Webhooks', description: 'Configure API keys and webhook connections', path: '/settings/integrations/api' },
      { id: 'apps', title: 'App Marketplace', description: 'Install integrations (bank, payroll, e-commerce)', path: '/settings/integrations/apps' },
    ],
  },
  {
    id: 'phase_10',
    title: 'Setup Center - Security & Access',
    tasks: [
      { id: 'users', title: 'User Access', description: 'Invite and set roles for team members', path: '/settings/users' },
      { id: 'security', title: 'Security Policies', description: 'Configure MFA and access controls', path: '/settings/security' },
    ],
  },
  {
    id: 'phase_11',
    title: 'Setup Center - Compliance',
    tasks: [
      { id: 'audit', title: 'Audit Trails', description: 'Enable and review audit logs', path: '/settings/compliance/audit' },
      { id: 'data_retention', title: 'Data Retention', description: 'Set data archiving policies', path: '/settings/compliance/retention' },
    ],
  },
  {
    id: 'phase_12',
    title: 'Setup Center - Go Live',
    tasks: [
      { id: 'review_go_live', title: 'Final Review', description: 'Review settings before going live', path: '/setup-center/review', required: true },
      { id: 'go_live', title: 'Go Live', description: 'Activate production workflows', path: '/setup-center/go-live', required: true },
    ],
  },
]

export default function SetupCenter() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const [completed, setCompleted] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [seedLoading, setSeedLoading] = useState<boolean>(false)
  const [companyLoading, setCompanyLoading] = useState<boolean>(true)
  const [companyName, setCompanyName] = useState<string>('')
  const [companyAddress, setCompanyAddress] = useState<string>('')
  const [companySaved, setCompanySaved] = useState<boolean>(false)
  const [isCompleting, setIsCompleting] = useState<boolean>(false)
  const [done, setDone] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true)
      try {
        const progress: any = await onboardingService.getProgress()
        // Backend returns { steps: { stepName: data } }
        const stepMap = progress?.steps || {}
        const completedSteps = Object.entries(stepMap)
          .filter(([, v]) => (v as any)?.completed === true || (v as any)?.done === true)
          .map(([key]) => key)
        setCompleted(completedSteps)
      } catch {
        setMessage('Failed to load onboarding progress. Fallback to local status.')
      } finally {
        setIsLoading(false)
      }
    }
    loadProgress()
  }, [])

  useEffect(() => {
    async function loadCompanyProfile() {
      if (!companyId) {
        setCompanyLoading(false)
        return
      }
      setCompanyLoading(true)
      try {
        const res = await fetch(`/api/companies/${companyId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Company data not found')
        const data = await res.json()
        setCompanyName(data.name || '')
        setCompanyAddress(data.address || '')
      } catch {
        setMessage('Unable to load company profile. Please use settings.')
      } finally {
        setCompanyLoading(false)
      }
    }

    loadCompanyProfile()
  }, [companyId])

  const progress = useMemo(() => {
    const allTasks = SETUP_PHASES.flatMap(phase => phase.tasks)
    const required = allTasks.filter(task => task.required)
    if (!required.length) return 0
    const doneTasks = required.filter(task => completed.includes(task.id)).length
    return Math.round((doneTasks / required.length) * 100)
  }, [completed])

  const progressWidthClass = useMemo(() => {
    if (progress >= 100) return 'w-full'
    if (progress >= 80) return 'w-4/5'
    if (progress >= 60) return 'w-3/5'
    if (progress >= 40) return 'w-2/5'
    if (progress >= 20) return 'w-1/5'
    if (progress > 0) return 'w-1/12'
    return 'w-0'
  }, [progress])

  useEffect(() => {
    if (progress >= 100 && !done && !isCompleting) {
      ;(async () => {
        setIsCompleting(true)
        try {
          await onboardingService.complete()
          setDone(true)
          setMessage('Quick Setup complete! You are now ready to use Haypbooks.')
        } catch {
          setMessage('Failed to complete onboarding. Please try again.')
        } finally {
          setIsCompleting(false)
        }
      })()
    }
  }, [progress, done, isCompleting])

  useEffect(() => {
    if (done) {
      router.replace('/home/dashboard')
    }
  }, [done, router])

  const toggleStep = async (id: string) => {
    const shouldComplete = !completed.includes(id)
    setIsSaving(true)
    setMessage(null)

    try {
      await onboardingService.saveStep(id, { completed: shouldComplete, updatedAt: new Date().toISOString() })
      setCompleted((prev) =>
        shouldComplete ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
      )
    } catch {
      setMessage('Unable to save step progress. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const completeOnboarding = async () => {
    setIsCompleting(true)
    setMessage(null)

    try {
      await onboardingService.complete()
      setDone(true)
      setMessage('Quick Setup complete! You are now ready to use Haypbooks.')
    } catch {
      setMessage('Failed to complete onboarding. Please try again.')
    } finally {
      setIsCompleting(false)
    }
  }

  const saveBusinessProfile = async () => {
    if (!companyId) {
      setMessage('Missing company context. Please select a company.')
      return
    }

    setIsSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName, address: companyAddress }),
      })
      if (!response.ok) throw new Error('Failed to save business profile')
      setCompanySaved(true)

      if (!completed.includes('business_profile')) {
        await onboardingService.saveStep('business_profile', { completed: true, updatedAt: new Date().toISOString() })
        setCompleted(prev => [...new Set([...prev, 'business_profile'])])
      }
      setMessage('Business profile saved and marked complete.')
    } catch (error: any) {
      setMessage(error?.message || 'Unable to save business profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeedAccounts = async () => {
    setSeedLoading(true)
    setMessage(null)

    try {
      if (!companyId) {
        throw new Error('Missing companyId')
      }

      const response = await fetch(`/api/companies/${companyId}/accounting/accounts/seed-default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'Failed to seed COA')
        throw new Error(text || 'Failed to seed COA')
      }

      await onboardingService.saveStep('coa_seed', { completed: true, updatedAt: new Date().toISOString() })
      setCompleted((prev) => [...new Set([...prev, 'coa_seed'])])
      setMessage('Chart of Accounts has been initialized successfully.')
    } catch (error: any) {
      setMessage(error?.message || 'Unable to initialize Chart of Accounts.')
    } finally {
      setSeedLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">Loading setup progress...</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Setup Center</h1>
      <p className="text-sm text-slate-500 mb-6">Follow these steps to complete your owner onboarding setup and unlock features.</p>

      <section className="rounded-xl border p-4 mb-6 bg-slate-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Business Profile</h2>
          <span className="text-xs text-slate-500">{companySaved ? 'Saved' : 'Draft'}</span>
        </div>
        {companyLoading ? (
          <p className="text-sm text-slate-500">Loading company profile...</p>
        ) : (
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Company Name</label>
              <input
                className="mt-1 w-full rounded border-gray-300 p-2 text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Company Address</label>
              <textarea
                className="mt-1 w-full rounded border-gray-300 p-2 text-sm"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                rows={3}
              />
            </div>
            <button
              onClick={saveBusinessProfile}
              disabled={companyLoading || isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              data-testid="save-business-profile"
            >
              {isSaving ? 'Saving…' : 'Save Business Profile'}
            </button>
          </div>
        )}
      </section>

      {message && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">{message}</div>
      )}

      <div className="border rounded-xl p-4 mb-6 bg-slate-50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Quick Setup progress</span>
          <span className="text-xs font-medium text-slate-600">{progress}% complete</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-2 rounded-full bg-emerald-500 transition-all ${progressWidthClass}`} />
        </div>
      </div>

      <div className="space-y-8">
        {SETUP_PHASES.map((phase) => (
          <section key={phase.id} className="rounded-xl border p-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">{phase.title}</h2>
            <div className="grid gap-3">
              {phase.tasks.map((task) => {
                const doneTask = completed.includes(task.id)
                return (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{task.title}</div>
                      <p className="text-xs text-slate-500">{task.description}</p>
                      <a href={task.path} className="text-xs text-blue-600 hover:underline">Go to setting</a>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-bold ${doneTask ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}`}
                      onClick={() => toggleStep(task.id)}
                      disabled={isSaving || done}
                    >
                      {doneTask ? 'Done' : 'Pending'}
                    </button>
                    {task.id === 'coa_seed' && (
                      <button
                        onClick={handleSeedAccounts}
                        disabled={seedLoading || doneTask}
                        className="ml-2 px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        data-testid="seed-accounts-btn"
                      >
                        {seedLoading ? 'Seeding…' : 'Seed Default Accounts'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={completeOnboarding}
          disabled={isCompleting || done}
        >
          {done ? 'Completed' : isCompleting ? 'Completing...' : 'Complete Quick Setup'}
        </button>
        {isSaving && <span className="text-sm text-slate-500">Saving step status...</span>}
      </div>

      {done && <p className="mt-3 text-sm text-emerald-700">Onboarding is complete. Redirecting to dashboard soon.</p>}

      <div className="mt-6 text-xs text-slate-500">Step statuses are now saved in backend onboarding service.</div>
    </div>
  )
}
