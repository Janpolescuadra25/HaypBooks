import React from 'react'

type Props = { initial?: any; onSave: (d: any) => Promise<void> }

export default function BankingPayments({ initial = {}, onSave }: Props) {
  async function handleSave() { await onSave({ bankAccount: initial.bankAccount ?? null, gateway: initial.gateway ?? null }) }
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">Add bank connections and payment gateway preferences.</p>
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={handleSave}>Save and continue</button>
      </div>
    </div>
  )
}
