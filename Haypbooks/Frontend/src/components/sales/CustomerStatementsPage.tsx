'use client'

import { useMemo, useState } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'

type StatementRow = {
  id: string
  statementId: string
  customer: string
  periodStart: string
  periodEnd: string
  openingBalance: string
  closingBalance: string
  status: 'Sent' | 'Viewed' | 'Paid'
}

// TODO: Replace with API data when backend endpoint exists
const DEFAULT_STATEMENTS: StatementRow[] = [
  { id: 'stmt1', statementId: 'STMT-001', customer: 'Acme Corporation', periodStart: '2026-01-01', periodEnd: '2026-01-31', openingBalance: '$1,200.00', closingBalance: '$950.00', status: 'Sent' },
  { id: 'stmt2', statementId: 'STMT-002', customer: 'TechStart Inc', periodStart: '2026-02-01', periodEnd: '2026-02-28', openingBalance: '$450.00', closingBalance: '$300.00', status: 'Viewed' },
  { id: 'stmt3', statementId: 'STMT-003', customer: 'Global Logistics', periodStart: '2026-03-01', periodEnd: '2026-03-31', openingBalance: '$0.00', closingBalance: '$0.00', status: 'Paid' },
]

export default function CustomerStatementsPage() {
  const { loading: companyLoading } = useCompanyId()
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const columns = useMemo<HaypColumn<StatementRow>[]>(
    () => [
      { id: 'statementId', header: 'Statement ID', accessorKey: 'statementId', size: 180 },
      { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 200 },
      { id: 'periodStart', header: 'Period Start', accessorKey: 'periodStart', size: 140 },
      { id: 'periodEnd', header: 'Period End', accessorKey: 'periodEnd', size: 140 },
      { id: 'openingBalance', header: 'Opening Balance', accessorKey: 'openingBalance', size: 140, align: 'right' },
      { id: 'closingBalance', header: 'Closing Balance', accessorKey: 'closingBalance', size: 140, align: 'right' },
      { id: 'status', header: 'Status', accessorKey: 'status', size: 110 },
    ],
    [],
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Statements</h1>
            <p className="text-sm text-slate-500 mt-1">Generate customer account statements</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">Generate Statement</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Customer Statements" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <HaypDataTable
            data={DEFAULT_STATEMENTS}
            columns={columns}
            tableId="customer-statements"
            title="Customer Statements"
            globalFilter={search}
            onGlobalFilterChange={setSearch}
            searchPlaceholder="Search statements..."
            loading={companyLoading}
            onRefresh={() => {}}
            emptyTitle="No statements yet"
            emptySubtitle="Generate statement history to track customer balances."
          />
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Statements Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Generate and send account statements to customers for a selected date range.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Choose period-specific statements and monitor delivery status.</li>
                <li>Track opening and closing balances per customer.</li>
                <li>Provide a clear history for collections and account reconciliation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
