import React from 'react'

type Props = { initial?: any; onSave: (d: any) => Promise<void> }

export default function TaxCompliance({ initial = {}, onSave }: Props) {
  async function handleSave() { await onSave({ taxId: initial.taxId ?? '', filing: initial.filing ?? 'quarterly' }) }
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">Provide tax registration details and filing frequency.</p>
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={handleSave}>Save and continue</button>
      </div>
    </div>
  )
}
