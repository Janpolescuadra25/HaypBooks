"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePaymentsState } from '@/hooks/usePaymentsState'

export default function PaymentsSettingsPage() {
  const { state, save, seedApproved } = usePaymentsState()
  const router = useRouter()

  // Dev helper: seed approved state and jump to Manage
  function mockApproveAndGoManage() {
    seedApproved()
    router.push('/account-and-settings/payments/manage')
  }

  // Persistence handled by usePaymentsState

  // Ensure a merchant id exists once approved
  useEffect(() => {
    if (!state.merchantId && (state.status === 'approved' || state.status === 'pending')) {
      const existing = (()=>{ try { return JSON.parse(localStorage.getItem('hb.payments')||'{}').merchantId } catch { return undefined } })()
      const id = existing || `HBP-${Math.random().toString().slice(2,6)}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
      save({ merchantId: id })
    }
  }, [state.status, state.merchantId, save])

  const enrolled = state.status === 'approved'
  const pending = state.status === 'pending'
  const app = state.application
  const submittedAt = app?.submittedAt ? new Date(app.submittedAt) : undefined
  const pendingForHrs = submittedAt ? Math.floor((Date.now() - submittedAt.getTime()) / 36e5) : undefined

  function renderSummaryGrid() {
    if (!app) return null
    const deposit = app.deposit || {}
    const depositLines: string[] = []
    if (deposit.choice === 'existing') {
      depositLines.push(`Method: Existing bank`)
      if (deposit.existingAccountLabel) depositLines.push(`Account: ${deposit.existingAccountLabel}`)
    } else if (deposit.choice === 'checking') {
      depositLines.push(`Method: Haypbooks Checking`)
      if (deposit.cardName) depositLines.push(`Card name: ${deposit.cardName}`)
      if (deposit.coOwners) depositLines.push(`Co-owners: Yes`)
    }
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
        <SummaryCard title="Business" lines={summarize(app.business, ['legalName','entityType','taxId'])} href={pending ? '/account-and-settings/payments/setup/business' : undefined} />
        <SummaryCard title="Owner" lines={summarize(app.owner, ['firstName','lastName','email','phone'])} href={pending ? '/account-and-settings/payments/setup/owner' : undefined} />
        <SummaryCard title="Deposit" lines={depositLines.length ? depositLines : ['—']} href={pending ? '/account-and-settings/payments/setup/deposit' : undefined} />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Enrollment card */}
      {state.status === 'not-enrolled' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Get paid with Haypbooks Payments</h2>
          <p className="mt-1 text-sm text-slate-600">Accept Cards, ACH, Apple Pay, PayPal, and Venmo. Add pay links to invoices, share payment links, or use a card reader.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
              onClick={() => {
                try {
                  const isPrimary = JSON.parse(localStorage.getItem('hb.isPrimaryAdmin') || 'true')
                  if (!isPrimary) { alert('Only the primary admin can apply for Payments.'); return }
                } catch {}
                router.push('/account-and-settings/payments/setup')
              }}
              >
              Learn more & apply
            </button>
            <button
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={mockApproveAndGoManage}
            >
              Mock: Go to Manage
            </button>
          </div>
        </div>
      )}

      {pending && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold">Application under review</h2>
          <p className="mt-1 text-sm">We typically approve within 1–3 days. Submitted {submittedAt?.toLocaleDateString()} {submittedAt && `(${pendingForHrs}h ago)`}. You&apos;ll get an email when you&apos;re approved.</p>
          {renderSummaryGrid()}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50" onClick={() => save({ status: 'approved' })}>Mark as approved</button>
            <button className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50" onClick={() => save({ status: 'not-enrolled', application: undefined })}>Cancel application</button>
          </div>
        </div>
      )}

      {/* Settings when approved */}
      {enrolled && (
        <div className="space-y-6">
          {/* Application summary */}
          {app && (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-emerald-900">Payments account active</h2>
                <p className="mt-1 text-sm text-emerald-800">Approved on {submittedAt?.toLocaleDateString()}. Below is a snapshot of your application.</p>
                {renderSummaryGrid()}
              </div>
              <MerchantDetailsCard merchantId={state.merchantId} />
              <DepositSpeedCard depositAccount={state.depositAccount} sameDayEnabled={state.sameDayEnabled} />
              <DocumentsCard />
              <ChartOfAccountsCard />
              <AcceptInMomentCard ownerPhone={app.owner?.phone} />
            </div>
          )}
          {/* Methods */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Payment methods</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {([
                ['Cards', 'cards'],
                ['ACH', 'ach'],
                ['Apple Pay', 'applePay'],
                ['PayPal', 'paypal'],
                ['Venmo', 'venmo'],
              ] as const).map(([label, key]) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    checked={(state.methods as any)[key]}
                    onChange={(e) => save({ methods: { ...state.methods, [key]: e.target.checked } })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deposit account */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Deposit account</h3>
            <div className="mt-3 grid gap-3 text-sm">
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <input type="radio" name="deposit" className="mt-1" checked={state.depositAccount === 'bank'} onChange={() => save({ depositAccount: 'bank' })} />
                <div>
                  <div className="font-medium text-slate-800">Checking •••• 1234</div>
                  <div className="text-slate-500">Standard deposits, typically next business day.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                <input type="radio" name="deposit" className="mt-1" checked={state.depositAccount === 'qb-checking'} onChange={() => save({ depositAccount: 'qb-checking', instantDeposit: true })} />
                <div>
                  <div className="font-medium text-slate-800">Haypbooks Checking</div>
                  <div className="text-slate-600">Instant deposit at no extra cost when funds go to Haypbooks Checking.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Instant deposit */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Instant deposit</h3>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <p className="text-slate-600">
                {state.depositAccount === 'qb-checking'
                  ? 'Included at no extra cost with Haypbooks Checking.'
                  : 'Move eligible payouts to your bank instantly (fees may apply).'}
              </p>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={state.instantDeposit}
                  onChange={(e) => save({ instantDeposit: e.target.checked })}
                />
                <span>{state.instantDeposit ? 'On' : 'Off'}</span>
              </label>
            </div>
          </div>

          {/* Dispute protection */}
          {state.disputeEligible && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
              <h3 className="text-sm font-semibold text-slate-800">Payments Dispute Protection</h3>
              <div className="mt-2 grid gap-1 text-slate-600">
                <div className="flex justify-between"><span>Coverage limit</span><span>$25,000/year</span></div>
                <div className="flex justify-between"><span>Remaining coverage</span><span>{state.disputeProtection ? '$25,000' : '—'}</span></div>
                <div className="text-xs"><a href="#" onClick={(e)=>e.preventDefault()} className="text-emerald-700 hover:underline">See coverage details</a></div>
              </div>
              <div className="mt-3 flex justify-end">
                {state.disputeProtection ? (
                  <button className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" onClick={()=>save({ disputeProtection:false })}>Turn off</button>
                ) : (
                  <button className="rounded-full text-white bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-700" onClick={()=>save({ disputeProtection:true })}>Turn on</button>
                )}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Help</h3>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li><a className="text-emerald-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>How to take invoice payments online</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>Set up Apple Pay, PayPal, and Venmo</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>About Instant deposit</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>Payments Dispute Protection overview</a></li>
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

function summarize(obj: any, keys: string[]): string[] {
  if (!obj) return ['—']
  return keys.filter(k => k in obj).map(k => `${labelize(k)}: ${fmtValue(obj[k])}`)
}
function labelize(k: string) {
  return k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())
}
function fmtValue(v: any) {
  if (v === '' || v === undefined || v === null) return '—'
  return String(v)
}

function SummaryCard({ title, lines, href }: { title: string; lines: string[]; href?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <ul className="space-y-0.5 text-xs text-slate-700">
        {lines.map((l,i)=>(<li key={i}>{l}</li>))}
      </ul>
      {href && (
        <div className="mt-2">
          <Link href={href as any} className="text-xs text-emerald-700 hover:underline">Edit</Link>
        </div>
      )}
    </div>
  )
}

function AcceptInMomentCard({ ownerPhone }: { ownerPhone?: string }) {
  const [phone, setPhone] = useState(ownerPhone || '')
  useEffect(()=>{ setPhone(ownerPhone || '') }, [ownerPhone])
  function savePhone() {
    try {
      const raw = localStorage.getItem('hb.payments')
      const base = raw ? JSON.parse(raw) : {}
      const next = { ...base, activationPhone: phone }
      localStorage.setItem('hb.payments', JSON.stringify(next))
    } catch {}
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Accept payments right in the moment</h3>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        <li>Download the free mobile payments app and order a card reader.</li>
        <li>Low, flat rates with no monthly fees.</li>
        <li>Syncs with Haypbooks to match with invoices and create sales receipts.</li>
      </ul>
      <div className="mt-4 max-w-sm space-y-2">
        <label className="block text-sm font-medium text-slate-700">Mobile phone number</label>
        <input
          className="input w-full"
          placeholder="(555) 555-5555"
          value={phone}
          onChange={e=>setPhone(e.target.value)}
          aria-label="Mobile phone number"
        />
        <div className="flex gap-2">
          <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700" onClick={savePhone}>Text me a link</button>
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={savePhone}>Done</button>
        </div>
        <div className="text-xs text-slate-500">
          <a href="#" onClick={(e)=>e.preventDefault()} className="text-emerald-700 hover:underline">Important offers, pricing details, & disclaimers</a>
        </div>
      </div>
    </div>
  )
}

function MerchantDetailsCard({ merchantId }: { merchantId?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Merchant details</h3>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><span className="font-medium text-slate-700">Merchant ID:</span> {merchantId || '—'}</li>
            <li>Run deposit reports</li>
            <li>See transaction details</li>
          </ul>
        </div>
        <div>
          <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700" onClick={()=>{ window.location.assign('/account-and-settings/payments/manage') }}>Manage account</button>
        </div>
      </div>
    </div>
  )
}

function DepositSpeedCard({ depositAccount, sameDayEnabled }: { depositAccount: string; sameDayEnabled?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
      <h3 className="text-sm font-semibold text-slate-800">Deposit speed</h3>
      <div className="mt-2 grid gap-1 text-slate-600">
        <div className="flex justify-between"><span>Credit Cards</span><span>1 business day</span></div>
        <div className="flex justify-between"><span>Bank Transfers</span><span>1–5 business days</span></div>
      </div>
      {depositAccount === 'qb-checking' && (
        <div className="mt-3 text-xs text-emerald-700">Eligible for instant deposit.</div>
      )}
      <div className="mt-3 text-xs">
        {sameDayEnabled ? (
          <div className="flex items-center justify-between">
            <span className="text-emerald-700">Same‑day speed: Enabled</span>
            <a href="#" onClick={e=>{ e.preventDefault(); window.location.assign('/account-and-settings/payments/deposit-speed') }} className="text-emerald-700 hover:underline">Manage</a>
          </div>
        ) : (
          <a href="#" onClick={e=>{ e.preventDefault(); window.location.assign('/account-and-settings/payments/deposit-speed') }} className="text-emerald-700 hover:underline">Get same‑day deposit speed set up</a>
        )}
      </div>
    </div>
  )
}

function DocumentsCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
      <h3 className="text-sm font-semibold text-slate-800">Documents</h3>
      <div className="mt-2 flex items-center gap-3 text-slate-600">
        <label className="text-xs font-medium" htmlFor="monthly-statement-select">Monthly Statements</label>
        <select id="monthly-statement-select" className="input h-8 w-40 text-xs" defaultValue="">
          <option value="" disabled>Select a month</option>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m=> <option key={m} value={m}>{m}</option> )}
        </select>
        <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">View</button>
      </div>
    </div>
  )
}

function ChartOfAccountsCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
      <h3 className="text-sm font-semibold text-slate-800">Chart of Accounts mapping</h3>
      <div className="mt-2 grid gap-2 text-xs text-slate-600">
        <MappingRow label="Standard deposits" account="Checking" />
        <MappingRow label="Instant deposits" account="Checking" />
        <MappingRow label="Processing fees" account="Payments Fees" />
      </div>
    </div>
  )
}

function MappingRow({ label, account }: { label: string; account: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span>{label}</span>
      <span className="font-medium text-slate-700">{account}</span>
    </div>
  )
}
