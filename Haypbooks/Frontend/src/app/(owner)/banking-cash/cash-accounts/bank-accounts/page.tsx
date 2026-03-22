'use client'

import { useEffect, useState, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'

type BankAccount = {
  id: string
  name: string
  institution?: string
  accountNumber?: string
  currency: string
  currentBalance: number
}

export default function Page() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountCurrency, setAccountCurrency] = useState(currency || 'USD')
  const [currentBalance, setCurrentBalance] = useState('0')

  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get<BankAccount[]>(`/companies/${companyId}/banking/accounts`)
      setAccounts(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load bank accounts')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const addAccount = async () => {
    if (!companyId || !name.trim()) return
    setLoading(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/banking/accounts`, {
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        currency: accountCurrency || 'USD',
        currentBalance: Number(currentBalance || 0),
      })
      setName('')
      setAccountNumber('')
      setAccountCurrency(currency || 'USD')
      setCurrentBalance('0')
      await loadAccounts()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create bank account')
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0)

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-2xl font-bold text-emerald-900">Bank Accounts</h1>
      <p className="text-sm text-slate-500">Manage your bank accounts and cash position.</p>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Cash Position</h2>
          <span className="text-lg font-black text-emerald-700">{formatCurrency(totalBalance, currency)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account Name" className="input" />
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account Number" className="input" />
          <input value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value)} placeholder="Currency" className="input" />
          <input value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="Current Balance" type="number" className="input" />
        </div>

        <button onClick={addAccount} disabled={!name.trim() || loading} className="mt-3 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition">
          {loading ? 'Saving...' : 'Add Bank Account'}
        </button>
      </div>

      {error && <div className="text-sm text-rose-700">{error}</div>}

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Bank Accounts</h3>
        {loading && <p className="text-sm text-slate-500">Loading accounts...</p>}
        {!loading && accounts.length === 0 && <p className="text-sm text-slate-500">No bank accounts yet.</p>}

        {accounts.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b border-slate-200">Name</th>
                <th className="p-2 border-b border-slate-200">Acct #</th>
                <th className="p-2 border-b border-slate-200">Currency</th>
                <th className="p-2 border-b border-slate-200">Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="p-2 border-b border-slate-100">{acc.name}</td>
                  <td className="p-2 border-b border-slate-100">{acc.accountNumber || '-'}</td>
                  <td className="p-2 border-b border-slate-100">{acc.currency || 'USD'}</td>
                  <td className="p-2 border-b border-slate-100 font-bold">{formatCurrency(acc.currentBalance, acc.currency ?? currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

