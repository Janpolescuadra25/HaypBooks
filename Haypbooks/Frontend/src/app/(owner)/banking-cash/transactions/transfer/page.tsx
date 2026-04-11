'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { MOCK_BANK_ACCOUNTS, mockStore, type MockBankTransaction } from '../mockGLState'

let transferCounter = 1

function nextTransferRef() {
  const ref = `TF-2026-${String(transferCounter).padStart(4, '0')}`
  transferCounter++
  return ref
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function TransferPage() {
  const router = useRouter()

  const [fromAccount, setFromAccount] = useState(MOCK_BANK_ACCOUNTS[0].id)
  const [toAccount,   setToAccount]   = useState(MOCK_BANK_ACCOUNTS[1].id)
  const [amount,      setAmount]      = useState('')
  const [date,        setDate]        = useState(today())
  const [memo,        setMemo]        = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [savedRef,    setSavedRef]    = useState('')

  const fromAcct = MOCK_BANK_ACCOUNTS.find(b => b.id === fromAccount)
  const toAcct   = MOCK_BANK_ACCOUNTS.find(b => b.id === toAccount)
  const amtNum   = parseFloat(amount) || 0
  const canSave  = fromAccount && toAccount && fromAccount !== toAccount && amtNum > 0 && date

  const handleSave = () => {
    if (!canSave) return
    setSaving(true)

    const ref = nextTransferRef()
    const withdrawalId = `tf-w-${Date.now()}`
    const depositId    = `tf-d-${Date.now() + 1}`

    const withdrawal: MockBankTransaction = {
      id: withdrawalId,
      date,
      accountId: fromAccount,
      description: `TRANSFER OUT → ${toAcct?.name ?? toAccount}  [${ref}]`,
      amount: -amtNum,
      status: 'CATEGORIZED',
      transactionType: 'Bank Payment',
      memo: memo || undefined,
      bankRef: ref,
    }
    const deposit: MockBankTransaction = {
      id: depositId,
      date,
      accountId: toAccount,
      description: `TRANSFER IN ← ${fromAcct?.name ?? fromAccount}  [${ref}]`,
      amount: amtNum,
      status: 'CATEGORIZED',
      transactionType: 'Bank Receipt',
      memo: memo || undefined,
      bankRef: ref,
    }

    mockStore.items.push(withdrawal, deposit)

    setSavedRef(ref)
    setSaving(false)
    setSaved(true)
  }

  const fmtAmt = (n: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n)

  if (saved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Transfer Saved</h2>
          <p className="text-sm text-slate-500 mb-1">Reference: <span className="font-mono font-semibold text-slate-700">{savedRef}</span></p>
          <p className="text-sm text-slate-500 mb-6">
            {fromAcct?.name} → {toAcct?.name}<br />
            <span className="font-semibold text-slate-700">{fmtAmt(amtNum)}</span>
          </p>
          <button onClick={() => router.push('/banking-cash/transactions')}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Back to Bank Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Transfer Entry</h1>
          <p className="text-xs text-slate-400">Move funds between bank accounts</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* From / To */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Transfer Details</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">From Account</label>
              <select value={fromAccount} onChange={e => setFromAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {MOCK_BANK_ACCOUNTS.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === toAccount}>
                    {b.name} ({b.accountNumber}) — {fmtAmt(b.balance)}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight size={20} className="text-slate-400 mt-5 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">To Account</label>
              <select value={toAccount} onChange={e => setToAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {MOCK_BANK_ACCOUNTS.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === fromAccount}>
                    {b.name} ({b.accountNumber}) — {fmtAmt(b.balance)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {fromAccount === toAccount && fromAccount && (
            <p className="mt-2 text-xs text-red-500">From and To accounts must be different.</p>
          )}
        </div>

        {/* Amount & Date */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Amount & Date</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Amount (₱)</label>
              <input
                type="number" min="0.01" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Memo <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="Reference or notes…"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* JE Preview */}
        {amtNum > 0 && fromAcct && toAcct && fromAccount !== toAccount && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Journal Entry Preview</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Account</th>
                  <th className="pb-2 font-medium text-right">Debit</th>
                  <th className="pb-2 font-medium text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="py-1">
                  <td className="py-1.5 text-slate-700">{toAcct.name} <span className="text-slate-400">(To)</span></td>
                  <td className="py-1.5 text-right font-mono font-semibold text-slate-800">{fmtAmt(amtNum)}</td>
                  <td className="py-1.5 text-right text-slate-300">—</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-700">{fromAcct.name} <span className="text-slate-400">(From)</span></td>
                  <td className="py-1.5 text-right text-slate-300">—</td>
                  <td className="py-1.5 text-right font-mono font-semibold text-slate-800">{fmtAmt(amtNum)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave || saving}
            className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Transfer
          </button>
        </div>
      </div>
    </div>
  )
}
