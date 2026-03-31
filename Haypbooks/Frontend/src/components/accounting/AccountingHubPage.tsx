'use client'

import React, { useState } from 'react'
import ChartOfAccountsPage from '@/components/accounting/ChartOfAccountsPage'
import JournalEntriesPage from '@/components/accounting/JournalEntriesPage'
import GeneralLedgerPage from '@/components/accounting/GeneralLedgerPage'
import TrialBalancePage from '@/components/accounting/TrialBalancePage'

const tabConfig = [
  { id: 'chart-of-accounts', label: 'Chart of Accounts' },
  { id: 'journal-entries', label: 'Journal Entries' },
  { id: 'general-ledger', label: 'General Ledger' },
  { id: 'trial-balance', label: 'Trial Balance' },
] as const

type TabId = (typeof tabConfig)[number]['id']

export default function AccountingHubPage() {
  const [activeTab, setActiveTab] = useState<TabId>('chart-of-accounts')

  const renderTab = () => {
    switch (activeTab) {
      case 'chart-of-accounts':
        return <ChartOfAccountsPage />
      case 'journal-entries':
        return <JournalEntriesPage />
      case 'general-ledger':
        return <GeneralLedgerPage />
      case 'trial-balance':
        return <TrialBalancePage />
      default:
        return null
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Accounting Hub</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Quickly access core accounting modules in one place. Manage chart of accounts, journal entries, general ledger, and trial balance with consistent navigation and workflow.
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          Core Accounting Toolkit
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div role="tablist" aria-label="Accounting modules" className="flex flex-wrap gap-2">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  )
}
