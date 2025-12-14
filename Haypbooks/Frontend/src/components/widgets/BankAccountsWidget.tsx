"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type BankAccount = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit-card'
  balance: number
  lastReconciled?: string
  needsReconciliation: boolean
}

type BankAccountsApiResponse = { accounts?: BankAccount[] }

export default function BankAccountsWidget() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api<BankAccountsApiResponse>('/api/dashboard/bank-accounts')
        setAccounts(data?.accounts || [])
      } catch (err) {
        console.error('Failed to load bank accounts', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Bank Accounts</h3>
        <Link href={'/bank-transactions' as any} className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View all
        </Link>
      </div>
      
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <p className="mb-2">No bank accounts connected</p>
            <Link href={'/bank-transactions/connect' as any} className="btn-primary btn-xs">
              Connect account
            </Link>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{account.name}</h4>
                  <span className="text-xs text-slate-500 uppercase">{account.type}</span>
                </div>
                {account.needsReconciliation && (
                  <p className="text-xs text-amber-600 mt-1">Needs reconciliation</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  <Amount value={account.balance} />
                </p>
                {account.lastReconciled && (
                  <p className="text-xs text-slate-500">Last: {account.lastReconciled}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link href={'/bank-transactions/reconcile' as any} className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          Reconcile accounts →
        </Link>
      </div>
    </div>
  )
}
