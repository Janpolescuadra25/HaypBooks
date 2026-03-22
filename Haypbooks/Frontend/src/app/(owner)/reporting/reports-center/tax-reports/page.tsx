'use client'

import React, { useState } from 'react'
import { FileText } from 'lucide-react'

const REPORTS = [
  'Sales Tax Summary',
  'VAT Return',
  'Withholding Tax Report',
]

export default function Page() {
  const [refreshTime] = useState(() => new Date().toLocaleTimeString())
  return (
    <div className="p-4 sm:p-6 min-h-full flex flex-col">
      <div className="border-l-4 border-emerald-500 pl-4 mb-8">
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">/ REPORTING &amp; ANALYTICS</p>
        <h1 className="text-3xl font-black text-emerald-900 tracking-tight">TAX REPORTS</h1>
        <p className="text-slate-600 mt-1 max-w-2xl">Deploy advanced data models and generate high-fidelity financial reports for strategic business intelligence.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {REPORTS.map((title) => (
          <div key={title} className="flex items-start gap-4 p-6 bg-white rounded-xl border border-slate-100 opacity-70 cursor-not-allowed">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">MODULE: TAX</p>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">{title}</h3>
              <span className="inline-flex items-center text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-emerald-100 flex flex-wrap justify-between gap-2 text-xs text-slate-400 uppercase tracking-widest">
        <span>SYSTEM STATUS: OPERATIONAL</span>
        <span>DATA REFRESH: {refreshTime}</span>
        <span>REPORTING ENGINE V4.2.0</span>
      </div>
    </div>
  )
}
