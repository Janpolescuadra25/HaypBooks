import React from 'react'

type Props = { initial?: any; onSave: (d: any) => Promise<void> }

export default function FiscalAccounting({ initial = {}, onSave }: Props) {
  async function handleSave() { await onSave({ fiscalStart: initial.fiscalStart ?? 'Jan', accountingMethod: initial.accountingMethod ?? 'accrual' }) }
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">Configure fiscal year start and accounting method (defaults provided).</p>
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={handleSave}>Save and continue</button>
      </div>
    </div>
  )
}
