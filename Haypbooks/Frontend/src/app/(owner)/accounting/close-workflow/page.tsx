'use client'

import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import Link from 'next/link'

interface WorkflowStep {
  id: string
  name: string
  status: 'Pending' | 'Completed' | 'Error'
  description?: string
  valid?: boolean
  action?: { type: 'go' | 'run'; label: string; link?: string }
}

interface CloseWorkflowChecks {
  coa: boolean
  journalEntries: boolean
  trialBalance: boolean
}

interface ApiResponse {
  steps: WorkflowStep[]
  checks: CloseWorkflowChecks
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Error: 'bg-red-100 text-red-700 border-red-200',
}

function StepCard({ step, onRun }: { step: WorkflowStep; onRun: (id: string) => void }) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{step.name}</h3>
            {typeof step.valid !== 'undefined' && (
              <span className={`text-xs font-semibold ${step.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                {step.valid ? '✅ Passed' : '❌ Failed'}
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full border text-[11px] font-semibold ${statusStyles[step.status]}`}>
            {step.status}
          </span>
        </div>
        {step.description && <p className="text-xs text-slate-500 mt-1">{step.description}</p>}
      </div>
      <div className="flex justify-start sm:justify-end items-center gap-2">
        {step.action?.type === 'go' && step.action.link && (
          <Link href={step.action.link} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
            {step.action.label}
          </Link>
        )}
        {step.action?.type === 'run' && (
          <button
            onClick={() => onRun(step.id)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-50 bg-emerald-600 hover:bg-emerald-700"
          >
            {step.action.label}
          </button>
        )}
      </div>
    </article>
  )
}

export default function CloseWorkflowPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [checks, setChecks] = useState<CloseWorkflowChecks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [closeSuccess, setCloseSuccess] = useState('')
  const [completing, setCompleting] = useState(false)

  const fetchSteps = async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<ApiResponse>(`/accounting/close-workflow`, { params: { companyId } })
      if (Array.isArray(data.steps)) setSteps(data.steps)
      else setSteps([])
      setChecks(data.checks ?? null)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Unable to load workflow steps')
      setChecks(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSteps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const runStep = async (stepId: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/accounting/close-workflow/run`, { companyId, stepId })
      await fetchSteps()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to execute step')
    }
  }

  const completeClose = async () => {
    if (!companyId) return
    if (!checks || !checks.coa || !checks.journalEntries || !checks.trialBalance) return

    setCompleting(true)
    setError('')
    setCloseSuccess('')

    try {
      const { data } = await apiClient.post('/accounting/close-workflow/complete', { companyId })
      setCloseSuccess(data?.message ?? 'Period Closed Successfully')
      await fetchSteps()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to complete close workflow')
    } finally {
      setCompleting(false)
    }
  }

  if (cidLoading || loading) {
    return <div className="p-6 text-center text-slate-500">Loading Close Workflow…</div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  const labelForCheck = (key: keyof CloseWorkflowChecks) => {
    switch (key) {
      case 'coa':
        return 'Chart of Accounts'
      case 'journalEntries':
        return 'Journal Entries'
      case 'trialBalance':
        return 'Trial Balance'
      default:
        return key
    }
  }

  const checksAllPassed = checks?.coa && checks?.journalEntries && checks?.trialBalance

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-5">
        <h1 className="text-2xl font-bold text-slate-900">Close Workflow</h1>
        <p className="text-sm text-slate-500 mt-1">Track and execute the month-end accounting close steps in one place.</p>
      </div>

      {checks && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(checks).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-2 bg-slate-50 text-xs font-semibold inline-flex items-center justify-between">
              <span>{labelForCheck(key as keyof CloseWorkflowChecks)}</span>
              <span className={value ? 'text-emerald-700' : 'text-rose-700'}>{value ? '✅ Passed' : '❌ Failed'}</span>
            </div>
          ))}
        </div>
      )}

      {checks && checks.journalEntries === false && (
        <div className="bg-yellow-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm">
          You have unposted Journal Entries.
        </div>
      )}

      {checksAllPassed && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-green-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex-1 text-sm text-emerald-800">All close checks passed. Period is eligible to be closed.</div>
          <button
            onClick={completeClose}
            disabled={completing}
            className="px-4 py-2 rounded-lg text-white font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {completing ? 'Closing...' : 'Complete Close'}
          </button>
        </div>
      )}

      {closeSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-2 text-sm">{closeSuccess}</div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      <div className="grid gap-3">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} onRun={runStep} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4 text-sm text-slate-500">
        Use this workflow to verify core accounts, journal entries, ledger balances, and trial balance status before locking the period.
      </div>
    </div>
  )
}
