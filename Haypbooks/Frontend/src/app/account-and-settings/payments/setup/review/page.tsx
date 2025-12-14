"use client"
import { useRouter } from 'next/navigation'

export default function PaymentsSetupReviewPage() {
  const router = useRouter()

  const business = safeParse('hb.payments.enroll.business')
  const owner = safeParse('hb.payments.enroll.owner')
  const deposit = safeParse('hb.payments.enroll.deposit')

  // Guard: redirect to first incomplete step
  if (typeof window !== 'undefined') {
    if (!business) {
      router.replace('/account-and-settings/payments/setup/business')
    } else if (!owner) {
      router.replace('/account-and-settings/payments/setup/owner')
    } else if (!deposit) {
      router.replace('/account-and-settings/payments/setup/deposit')
    }
  }

  function submit() {
    try {
      const stateRaw = localStorage.getItem('hb.payments')
      const base = stateRaw ? JSON.parse(stateRaw) : {}
      const newState = {
        ...base,
        status: 'pending',
        application: { business, owner, deposit, submittedAt: new Date().toISOString() },
      }
      localStorage.setItem('hb.payments', JSON.stringify(newState))
    } catch {}
    router.push('/account-and-settings/payments')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Review & submit</h1>
        <button onClick={() => router.back()} className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">Back</button>
      </div>
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
        <Progress current={4} />
        <Section title="About your business" onEdit={()=>router.push('/account-and-settings/payments/setup/business')}>
          <pre className="whitespace-pre-wrap text-slate-700">{fmt(business)}</pre>
        </Section>
        <Section title="About you" onEdit={()=>router.push('/account-and-settings/payments/setup/owner')}>
          <pre className="whitespace-pre-wrap text-slate-700">{fmt(owner)}</pre>
        </Section>
        <Section title="Your deposit account" onEdit={()=>router.push('/account-and-settings/payments/setup/deposit')}>
          <pre className="whitespace-pre-wrap text-slate-700">{fmt(deposit)}</pre>
        </Section>
        <div className="pt-2 flex justify-end">
          <button onClick={submit} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700">Submit application</button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div>
      <div className="font-medium text-slate-800 mb-1 flex items-center justify-between">
        <span>{title}</span>
        {onEdit && <button onClick={onEdit} className="text-xs text-emerald-700 hover:underline">Edit</button>}
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">{children}</div>
    </div>
  )
}

function safeParse(key: string) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null }
}
function fmt(obj: any) {
  if (!obj) return '—'
  return Object.entries(obj)
    .map(([k,v]) => `${labelize(k)}: ${v === '' ? '—' : String(v)}`)
    .join('\n')
}
function labelize(key: string) {
  return key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())
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
