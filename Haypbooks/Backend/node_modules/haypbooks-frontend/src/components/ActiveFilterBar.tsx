"use client"

import ActiveFilterChips from './ActiveFilterChips'
import { useSearchParams } from 'next/navigation'

type Props = { slug: string }

const RECOGNIZED = ['start','end','type','status','channel','minMargin','minUtil','view','minTurn','segment','restriction','program','customer','vendor','vendorId','bucket']

export default function ActiveFilterBar({ slug }: Props) {
  const sp = useSearchParams()
  const s = new URLSearchParams(sp?.toString() || '')
  const hasAny = RECOGNIZED.some((k) => !!s.get(k))
  if (!hasAny) return null
  return (
    <div className="glass-card py-2 px-3">
      <ActiveFilterChips slug={slug} />
    </div>
  )
}
