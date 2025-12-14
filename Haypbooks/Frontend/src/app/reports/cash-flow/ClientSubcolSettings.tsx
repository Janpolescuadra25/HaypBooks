"use client"

import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { useRouter, useSearchParams } from 'next/navigation'

type Key = 'curr' | 'prev' | 'delta' | 'pct'

export default function CFClientSubcolSettings({ current }: { current: Key[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const currentSet = new Set(current)
  const options = [
    { key: 'curr', label: 'Current', required: true },
    { key: 'prev', label: 'Previous' },
    { key: 'delta', label: 'Δ' },
    { key: 'pct', label: '%' },
  ]

  function onChange(next: string[]) {
    const withCurr = Array.from(new Set(['curr', ...next]))
    const params = new URLSearchParams(sp.toString())
    if (withCurr && withCurr.length) params.set('subcols', withCurr.join(','))
    else params.delete('subcols')
    router.replace((`/reports/cash-flow${params.size ? `?${params.toString()}` : ''}`) as any)
  }

  return (
    <ColumnSettingsButton
      options={options as any}
      value={[...currentSet] as any}
      onChange={onChange}
      controlsId="cf-subcols"
    />
  )
}
