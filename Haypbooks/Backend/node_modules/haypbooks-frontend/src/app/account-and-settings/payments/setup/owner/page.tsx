"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OwnerForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  ownershipPct: string
  addressSameAsBusiness: boolean
  address: string
  ssnLast4: string
}
const EMPTY: OwnerForm = { firstName: '', lastName: '', email: '', phone: '', dob: '', ownershipPct: '', addressSameAsBusiness: true, address: '', ssnLast4: '' }

export default function PaymentsSetupOwnerPage() {
  const router = useRouter()
  const [form, setForm] = useState<OwnerForm>(EMPTY)
  const [touched, setTouched] = useState(false)
  // Guard: require Business step completed
  useEffect(() => {
    try {
      const businessDone = !!localStorage.getItem('hb.payments.enroll.business')
      if (!businessDone) router.replace('/account-and-settings/payments/setup/business')
    } catch {}
  }, [router])
  useEffect(() => {
    try { const raw = localStorage.getItem('hb.payments.enroll.owner'); if (raw) setForm({ ...EMPTY, ...JSON.parse(raw) }) } catch {}
  }, [])
  const isValid = form.firstName && form.lastName && form.email && form.phone && form.ownershipPct && (form.addressSameAsBusiness || form.address) && (!form.ssnLast4 || /^\d{4}$/.test(form.ssnLast4))
  function save() {
    setTouched(true)
    if (!isValid) return
    localStorage.setItem('hb.payments.enroll.owner', JSON.stringify(form))
    router.push('/account-and-settings/payments/setup/deposit')
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Owner details</h1>
        <button onClick={() => router.push('/account-and-settings/payments/setup/business')} className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">Back</button>
      </div>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Progress current={2} />
        <Field label="First name" required>
          <input className="input" value={form.firstName} onChange={e=>setForm(f=>({ ...f, firstName: e.target.value }))} placeholder="First" aria-label="First name" />
        </Field>
        <Field label="Last name" required>
          <input className="input" value={form.lastName} onChange={e=>setForm(f=>({ ...f, lastName: e.target.value }))} placeholder="Last" aria-label="Last name" />
        </Field>
        <div className="pt-2">
          <div className="font-medium text-slate-800 mb-2">Owner's personal address</div>
          <label className="inline-flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" checked={form.addressSameAsBusiness} onChange={e=>setForm(f=>({ ...f, addressSameAsBusiness: e.target.checked }))} aria-label="Same as business address" />
            <span>Same as business address</span>
          </label>
          {!form.addressSameAsBusiness && (
            <textarea className="input mt-2" rows={3} value={form.address} onChange={e=>setForm(f=>({ ...f, address: e.target.value }))} placeholder="Owner address" aria-label="Owner address" />
          )}
        </div>
        <div className="pt-2">
          <div className="font-medium text-slate-800 mb-2">Identity verification</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Date of birth (optional)</span>
              <input className="input mt-1" type="date" value={form.dob} onChange={e=>setForm(f=>({ ...f, dob: e.target.value }))} aria-label="Date of birth" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">SSN last 4 (optional)</span>
              <input className="input mt-1" maxLength={4} value={form.ssnLast4} onChange={e=>setForm(f=>({ ...f, ssnLast4: e.target.value.replace(/[^0-9]/g,'') }))} placeholder="1234" aria-label="Last 4 SSN" />
              <span className="mt-1 block text-[11px] text-slate-500">Used for account verification. This doesn’t impact credit score.</span>
            </label>
          </div>
        </div>
        <Field label="Email" required>
          <input className="input" type="email" value={form.email} onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} placeholder="name@example.com" aria-label="Email" />
        </Field>
        <Field label="Phone" required>
          <input className="input" value={form.phone} onChange={e=>setForm(f=>({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" aria-label="Phone" />
        </Field>
        <Field label="Ownership percentage" required>
          <input className="input" type="number" min={1} max={100} value={form.ownershipPct} onChange={e=>setForm(f=>({ ...f, ownershipPct: e.target.value }))} placeholder="100" aria-label="Ownership percentage" />
        </Field>
        {touched && !isValid && <p className="text-sm text-rose-600">Fill required fields.</p>}
        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={!isValid} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save & Continue</button>
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

function Progress({ current }: { current: number }) {
  const steps = ['Business','Owner','Deposit','Review']
  return (
    <ol className="mb-2 flex items-center justify-between gap-2 text-xs font-medium">
      {steps.map((s,i)=>{
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
