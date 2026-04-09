'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function JournalEntryActivityPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="text-xl font-bold text-emerald-950">Activity for Journal Entry {id}</h1>
      <p className="text-sm text-slate-500">Journal entry activity log coming soon.</p>
    </div>
  )
}
