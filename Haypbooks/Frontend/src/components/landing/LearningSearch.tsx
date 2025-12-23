'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LearningSearch() {
  const [q, setQ] = useState('')
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto">
      <label className="sr-only">Search learning</label>
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Search help articles, guides, or videos"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/learning-search?term=${encodeURIComponent(q)}`) }}
        />
        <button
          className="bg-emerald-600 text-white px-4 py-3 rounded-lg"
          onClick={() => router.push(`/learning-search?term=${encodeURIComponent(q)}`)}
        >Search</button>
      </div>
    </div>
  )
}
