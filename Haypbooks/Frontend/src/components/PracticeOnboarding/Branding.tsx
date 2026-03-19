import React from 'react'

type Props = { initial?: any; onSave: (d: any) => Promise<void> }

export default function Branding({ initial = {}, onSave }: Props) {
  async function handleSave() { await onSave({ logo: initial.logo ?? null, invoicePrefix: initial.invoicePrefix ?? '' }) }
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">Upload a logo and set invoice branding options.</p>
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={handleSave}>Save and continue</button>
      </div>
    </div>
  )
}
