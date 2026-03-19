import React from 'react'

type Props = { snapshot: any; onConfirm: () => void }

export default function Review({ snapshot, onConfirm }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Review & Confirm</h3>
      <pre className="text-xs text-slate-600 max-h-48 overflow-auto p-2 bg-slate-50 rounded">{JSON.stringify(snapshot, null, 2)}</pre>
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={onConfirm}>Finish setup</button>
      </div>
    </div>
  )
}
