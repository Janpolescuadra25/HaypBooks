import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

type Props = { initial?: any }

const SERVICE_OPTIONS = [
  {
    id: 'bookkeeping',
    label: 'Bookkeeping',
    desc: 'Record daily transactions, reconcile accounts, and maintain ledgers for clients.',
    icon: '📒',
  },
  {
    id: 'tax',
    label: 'Tax Preparation',
    desc: 'Prepare and file income tax, VAT, and other tax returns on behalf of clients.',
    icon: '🧾',
  },
  {
    id: 'payroll',
    label: 'Payroll Services',
    desc: 'Process employee salaries, benefits, and payroll compliance.',
    icon: '💵',
  },
  {
    id: 'audit',
    label: 'Audit & Assurance',
    desc: 'Conduct financial audits, reviews, and working paper management.',
    icon: '🔍',
  },
  {
    id: 'advisory',
    label: 'Advisory / Consulting',
    desc: 'Provide financial planning, forecasting, and business advisory services.',
    icon: '💡',
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Any other services your firm provides.',
    icon: '⚙️',
  },
]

const ServicesOffered = forwardRef(function ServicesOffered({ initial = {} }: Props, ref) {
  const [selected, setSelected] = useState<string[]>(initial?.services ?? ['bookkeeping'])

  useImperativeHandle(ref, () => ({
    getData: () => ({ services: selected }),
    hasRequiredData: () => selected.length > 0,
  }))

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICE_OPTIONS.map(opt => {
          const active = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              aria-pressed={active}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${active
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-100 bg-white hover:border-emerald-200'
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900">{opt.label}</h4>
                {active && <CheckCircle2 size={20} className="text-emerald-500" />}
              </div>
              <p className="text-xs text-slate-500">{opt.desc}</p>
            </button>
          )
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
          Please select at least one service to continue.
        </p>
      )}
    </div>
  )
})

export default ServicesOffered
