"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentsSetupPage() {
  const router = useRouter()
  const [businessDone, setBusinessDone] = useState(false)
  const [ownerDone, setOwnerDone] = useState(false)
  const [depositDone, setDepositDone] = useState(false)
  useEffect(() => {
    // Read completion state from localStorage
    try { setBusinessDone(!!localStorage.getItem('hb.payments.enroll.business')) } catch {}
    try { setOwnerDone(!!localStorage.getItem('hb.payments.enroll.owner')) } catch {}
    try { setDepositDone(!!localStorage.getItem('hb.payments.enroll.deposit')) } catch {}
  }, [])

  // Determine current sequential step
  const currentIndex = businessDone ? (ownerDone ? (depositDone ? 3 : 2) : 1) : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Set up online payments</h1>
            <p className="mt-2 text-sm text-slate-600">Sign up and manage payments and deposits all in one place. Do it all inside Haypbooks. See rates and terms.</p>
          </div>
          <div>
            <button onClick={() => router.back()} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Back</button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Progress current={currentIndex + 1} />
          {currentIndex === 0 && (
            <BlockingStep
              title="About your business"
              subtitle="Tell us a little more about your business."
              actionHref="/account-and-settings/payments/setup/business"
              stepNumber={1}
            />
          )}
          {currentIndex === 1 && (
            <BlockingStep
              title="About you"
              subtitle="Tell us about the business owner."
              actionHref="/account-and-settings/payments/setup/owner"
              stepNumber={2}
            />
          )}
          {currentIndex === 2 && (
            <BlockingStep
              title="Your deposit account"
              subtitle="Tell us where to deposit your payments."
              actionHref="/account-and-settings/payments/setup/deposit"
              stepNumber={3}
            />
          )}
          {currentIndex === 3 && (
            <ReviewGate onClick={()=>router.push('/account-and-settings/payments/setup/review')} />
          )}
        </div>
        <div className="mt-8 text-xs text-slate-500">By proceeding you acknowledge and agree to Haypbooks' Terms of Service and Deposit Account Agreement.</div>
      </div>
    </div>
  )
}

import type { Route } from 'next'

function BlockingStep({ title, subtitle, actionHref, stepNumber }: { title: string; subtitle: string; actionHref: Route; stepNumber: number }) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-inner">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold tracking-wide text-slate-700 mb-1">Step {stepNumber}</div>
          <h2 className="text-lg font-medium text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href={actionHref} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700">Start</Link>
        </div>
      </div>
    </div>
  )
}
function ReviewGate({ onClick }: { onClick: () => void }) {
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6">
      <h2 className="text-lg font-semibold text-emerald-800">Review & submit</h2>
      <p className="mt-1 text-sm text-emerald-700">All sections completed. Review your details before submission.</p>
      <div className="mt-4 flex justify-end">
        <button onClick={onClick} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700">Review details</button>
      </div>
    </div>
  )
}
function Progress({ current }: { current: number }) {
  // current is 1-based for display purposes
  const steps = ['Business','Owner','Deposit','Review']
  return (
    <ol className="flex items-center justify-between gap-2 text-xs font-medium">
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
