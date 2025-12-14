"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type PayrollSummary = {
  nextPayrollDate: string
  nextPayrollAmount: number
  employeeCount: number
  taxLiabilities: number
  ytdPayroll: number
}

export default function PayrollWidget() {
  const [summary, setSummary] = useState<PayrollSummary>({
    nextPayrollDate: '',
    nextPayrollAmount: 0,
    employeeCount: 0,
    taxLiabilities: 0,
    ytdPayroll: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type PayrollApiResponse = { summary?: PayrollSummary }
        const data = await api<PayrollApiResponse>('/api/dashboard/payroll')
        setSummary(data?.summary || { nextPayrollDate: '', nextPayrollAmount: 0, employeeCount: 0, taxLiabilities: 0, ytdPayroll: 0 })
      } catch (err) {
        console.error('Failed to load payroll', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Payroll</h3>
        <Link href="/payroll" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          Manage
        </Link>
      </div>
      
      {summary.nextPayrollDate ? (
        <>
          <div className="mb-4 p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg text-white">
            <p className="text-sm opacity-90 mb-1">Next Payroll</p>
            <p className="text-2xl font-bold mb-1">
              <Amount value={summary.nextPayrollAmount} />
            </p>
            <p className="text-sm opacity-90">{summary.nextPayrollDate}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{summary.employeeCount}</p>
              <p className="text-xs text-slate-600 mt-1">Employees</p>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-lg font-bold text-red-900">
                <Amount value={summary.taxLiabilities} />
              </p>
              <p className="text-xs text-red-700 mt-1">Tax Due</p>
            </div>
            
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-lg font-bold text-slate-900">
                <Amount value={summary.ytdPayroll} />
              </p>
              <p className="text-xs text-slate-600 mt-1">YTD</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-3">No payroll scheduled</p>
          <Link href={'/payroll/setup' as any} className="btn-primary btn-xs">
            Set up payroll
          </Link>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href="/payroll/employees" className="text-sky-600 hover:text-sky-700 font-medium">
          Employees
        </Link>
        <Link href={'/payroll/reports' as any} className="text-sky-600 hover:text-sky-700 font-medium">
          Reports
        </Link>
      </div>
    </div>
  )
}
