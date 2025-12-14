"use client"

import { BackButton } from '@/components/BackButton'
import { ReportPeriod, ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'

type Props = {
  backAria?: string
  backFallback?: string
  periodValue?: ReportPeriod
  showCompare?: boolean
  exportPath?: string
  rightExtras?: React.ReactNode
  showPeriodControls?: boolean
}

export function ReportHeader({ backAria = 'Back to Reports', backFallback = '/reports', periodValue, showCompare = false, exportPath, rightExtras, showPeriodControls = true }: Props) {
  return (
  <div className="glass-card print:hidden relative z-40">
      <div className="flex items-center justify-between gap-2">
        <BackButton ariaLabel={backAria} fallback={backFallback} />
        <div className="flex flex-wrap items-center justify-end gap-2 min-w-0" role="toolbar" aria-label="Report actions">
          {showPeriodControls ? <ReportPeriodSelect value={periodValue} showCompare={showCompare} /> : null}
          <RefreshButton />
          {exportPath ? <ExportCsvButton exportPath={exportPath} /> : null}
          <PrintButton />
          {rightExtras}
        </div>
      </div>
    </div>
  )
}
