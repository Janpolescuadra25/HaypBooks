"use client"
import { useCompanySettings } from '@/hooks/useCompanySettings'

export default function DashboardBrand() {
  const { state } = useCompanySettings()
  const logo = state.logoUrl as string | undefined
  const name = state.companyName || 'Your Company'
  return (
    <div className="flex items-center gap-2" aria-label="Brand">
      <div className="h-10 w-10 rounded bg-slate-200 border overflow-hidden flex items-center justify-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Logo" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-slate-500">Logo</span>
        )}
      </div>
      <span className="text-sm font-medium text-slate-800 truncate max-w-[160px]" title={name}>{name}</span>
    </div>
  )
}
