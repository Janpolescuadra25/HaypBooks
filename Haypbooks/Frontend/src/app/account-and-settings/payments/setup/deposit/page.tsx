"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DepositForm {
  choice: 'existing' | 'checking'
  existingAccountLabel: string
  cardName: string
  coOwners: boolean
}
const EMPTY: DepositForm = { choice: 'existing', existingAccountLabel: 'Sample Bank (••••1234)', cardName: '', coOwners: false }

export default function PaymentsSetupDepositPage() {
  const router = useRouter()
  const [form, setForm] = useState<DepositForm>(EMPTY)
  const [touched, setTouched] = useState(false)
  // Guard: require Business and Owner steps completed
  useEffect(() => {
    try {
      const biz = !!localStorage.getItem('hb.payments.enroll.business')
      const own = !!localStorage.getItem('hb.payments.enroll.owner')
      if (!biz) return router.replace('/account-and-settings/payments/setup/business')
      if (!own) return router.replace('/account-and-settings/payments/setup/owner')
    } catch {}
  }, [router])
  useEffect(() => { try { const raw = localStorage.getItem('hb.payments.enroll.deposit'); if (raw) setForm({ ...EMPTY, ...JSON.parse(raw) }) } catch {} }, [])
  const isValid = form.choice === 'existing' || (form.choice === 'checking' && form.cardName)
  function save() {
    setTouched(true)
    if (!isValid) return
    localStorage.setItem('hb.payments.enroll.deposit', JSON.stringify(form))
    router.push('/account-and-settings/payments/setup/review')
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Deposit account</h1>
        <button onClick={() => router.push('/account-and-settings/payments/setup/owner')} className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">Back</button>
      </div>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Progress current={3} />
        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-slate-50">
            <input type="radio" name="deposit-choice" className="mt-1" checked={form.choice==='existing'} onChange={()=>setForm(f=>({ ...f, choice:'existing' }))} aria-label="Use existing connected bank" />
            <div>
              <div className="font-medium text-slate-800">Use existing connected bank</div>
              <div className="text-sm text-slate-500">{form.existingAccountLabel} • Standard deposits.</div>
              {form.choice==='existing' && (
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
                    <span>{form.existingAccountLabel}</span>
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50">Verify</button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <span>A different business bank account</span>
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50">Add</button>
                  </div>
                </div>
              )}
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-slate-50">
            <input type="radio" name="deposit-choice" className="mt-1" checked={form.choice==='checking'} onChange={()=>setForm(f=>({ ...f, choice:'checking' }))} aria-label="Open Haypbooks Checking" />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-sm bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Recommended</span>
                <div className="font-medium text-slate-800">Haypbooks Checking</div>
              </div>
              <div className="text-sm text-slate-600 mt-1">Instant deposit at no extra cost. No monthly bank fees or minimum balances.</div>
              <div className="mt-2 text-xs"><a href="#" onClick={(e)=>e.preventDefault()} className="text-emerald-700 hover:underline">See the benefits</a></div>
              {form.choice==='checking' && (
                <div className="mt-3 space-y-3">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-700">Name on debit card<span className="text-rose-600"> *</span></span>
                    <input value={form.cardName} maxLength={26} onChange={e=>setForm(f=>({ ...f, cardName: e.target.value }))} className="input mt-1" placeholder="e.g. Jane Q. Owner" aria-label="Name on debit card" />
                    <span className="mt-1 block text-[11px] text-slate-500">26 character max. <a href="#" onClick={(e)=>e.preventDefault()} className="text-emerald-700 hover:underline">See your card preview</a>.</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.coOwners} onChange={e=>setForm(f=>({ ...f, coOwners: e.target.checked }))} aria-label="Has co-owners" />
                    <span>I have co-owners</span>
                  </label>
                </div>
              )}
            </div>
          </label>
        </div>
        {touched && !isValid && <p className="text-sm text-rose-600">Please provide the required card name.</p>}
        <div className="pt-2 flex justify-end gap-3">
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-50" onClick={()=>router.back()}>Back</button>
          <button onClick={save} disabled={!isValid} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
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
