'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Props = {
  page: number
  limit: number
  total?: number
}

export default function BillsPager({ page, limit, total }: Props) {
  const sp = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname() ?? ''

  const totalPages = total && limit ? Math.max(1, Math.ceil(total / limit)) : undefined
  const canPrev = page > 1
  const canNext = totalPages ? page < totalPages : true

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="text-sm text-slate-600">
        Page {page}{totalPages ? ` of ${totalPages}` : ''}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          className="btn-secondary btn-xs"
          onClick={() => {
            if (!canPrev) return
            const qs = new URLSearchParams(sp.toString())
            const next = Math.max(1, page - 1)
            qs.set('page', String(next))
            qs.set('limit', String(limit))
            router.replace(`${pathname}?${qs.toString()}` as any)
          }}
          disabled={!canPrev}
          aria-label="Previous page"
        >Prev</button>
        <button
          className="btn-secondary btn-xs"
          onClick={() => {
            if (!canNext) return
            const qs = new URLSearchParams(sp.toString())
            const next = page + 1
            qs.set('page', String(next))
            qs.set('limit', String(limit))
            router.replace(`${pathname}?${qs.toString()}` as any)
          }}
          disabled={!canNext}
          aria-label="Next page"
        >Next</button>
        <select
          aria-label="Rows per page"
          className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs"
          value={String(limit)}
          onChange={(e) => {
            const qs = new URLSearchParams(sp.toString())
            qs.set('limit', e.target.value)
            qs.set('page', '1')
            router.replace(`${pathname}?${qs.toString()}` as any)
          }}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  )
}
