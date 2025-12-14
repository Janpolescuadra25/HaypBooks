"use client"
function Progress({ current }: { current: number }) {
  const steps = ['Business','Owner','Deposit','Review']
  return (
    <ol className="mb-4 flex items-center justify-between gap-2 text-xs font-medium">
      {steps.map((s,i)=>{
        // current is 1-based
        const done = i < (current - 1)
        const active = i === (current - 1)
        return (
          <li key={s} className="flex-1">
            <div className={"flex items-center justify-center rounded-full border px-2 py-1 transition " + (active ? 'bg-emerald-600 text-white border-emerald-600' : done ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600')}>
              <span className="truncate">{s}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface BusinessForm {
  legalName: string
  dba: string
  entityType: string
  taxId: string
  address: string
}

const EMPTY: BusinessForm = { legalName: '', dba: '', entityType: '', taxId: '', address: '' }

export default function PaymentsSetupBusinessPage() {
  const router = useRouter()
  const [form, setForm] = useState<BusinessForm>(EMPTY)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hb.payments.enroll.business')
      if (raw) setForm({ ...EMPTY, ...JSON.parse(raw) })
    } catch {}
  }, [])

  function save() {
    setTouched(true)
    if (!isValid) return
    localStorage.setItem('hb.payments.enroll.business', JSON.stringify(form))
    router.push('/account-and-settings/payments/setup/owner')
  }

  const isValid = form.legalName && form.entityType && form.taxId && form.address

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Business details</h1>
        <button onClick={() => router.back()} className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">Back</button>
      </div>
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Progress current={1} />
        <Field label="Legal business name" required>
          <input value={form.legalName} onChange={e=>setForm(f=>({ ...f, legalName: e.target.value }))} className="input" placeholder="Legal name" aria-label="Legal business name" />
        </Field>
        <Field label="Doing business as (optional)">
          <input value={form.dba} onChange={e=>setForm(f=>({ ...f, dba: e.target.value }))} className="input" placeholder="Optional" aria-label="Doing business as" />
        </Field>
        <Field label="Entity type" required>
          <select value={form.entityType} onChange={e=>setForm(f=>({ ...f, entityType: e.target.value }))} className="input" aria-label="Entity type">
            <option value="">Select…</option>
            <option value="llc">LLC</option>
            <option value="corp">Corporation</option>
            <option value="sole">Sole proprietor</option>
            <option value="partnership">Partnership</option>
            <option value="nonprofit">Non-profit</option>
          </select>
        </Field>
        <Field label="Tax ID / EIN" required>
          <input value={form.taxId} onChange={e=>setForm(f=>({ ...f, taxId: e.target.value }))} className="input" placeholder="XX-XXXXXXX" />
        </Field>
        <Field label="Business address" required>
          <textarea value={form.address} onChange={e=>setForm(f=>({ ...f, address: e.target.value }))} className="input" rows={3} placeholder="Street, City, State, ZIP" aria-label="Business address" />
        </Field>
        {touched && !isValid && <p className="text-sm text-rose-600">Please fill all required fields.</p>}
        <div className="pt-2 flex justify-end">
          <button onClick={save} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50" disabled={!isValid}>Save & Continue</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}{required && <span className="text-rose-600"> *</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
