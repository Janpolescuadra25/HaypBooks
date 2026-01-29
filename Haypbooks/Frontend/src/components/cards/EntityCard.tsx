"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id?: string
  name?: string
  subtitle?: string
  members?: number
  connected?: boolean
  variant?: 'default' | 'register'
  onLaunch?: () => void
}

// Generate consistent color based on first letter
function getColorForLetter(letter: string) {
  const colors = {
    'G': 'bg-blue-500',
    'H': 'bg-purple-500',
    'N': 'bg-orange-500',
    'S': 'bg-pink-500',
    'A': 'bg-emerald-500',
    'B': 'bg-cyan-500',
    'C': 'bg-indigo-500',
    'D': 'bg-amber-500',
    'E': 'bg-rose-500',
    'F': 'bg-teal-500',
  }
  const upperLetter = letter.toUpperCase()
  return colors[upperLetter as keyof typeof colors] || 'bg-slate-500'
}

// Get plan badge color
function getPlanColor(plan?: string) {
  const planLower = (plan || '').toLowerCase()
  if (planLower.includes('enterprise')) return 'bg-emerald-50 text-emerald-700'
  if (planLower.includes('pro')) return 'bg-cyan-50 text-cyan-700'
  if (planLower.includes('starter') || planLower.includes('start')) return 'bg-orange-50 text-orange-700'
  return 'bg-slate-50 text-slate-700'
}

export default function EntityCard({ id, name, subtitle, members, connected, variant = 'default', onLaunch }: Props) {
  const router = useRouter()

  if (variant === 'register') {
    return (
      <div 
        role="button" 
        onClick={() => router.push('/companies/new')} 
        aria-label="Register entity" 
        className="add-entity-card bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 transition cursor-pointer flex flex-col items-center justify-center h-[220px]"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-[12px] flex items-center justify-center mb-3 shadow-[0_8px_20px_rgba(2,6,23,0.04)]">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-900 mb-1">Add Company</h3>
        <p className="text-[10px] text-slate-500 font-medium normal-case">Expand portfolio</p>
      </div>
    )
  }

  const firstLetter = name ? name[0].toUpperCase() : 'C'
  const colorClass = getColorForLetter(firstLetter)
  const planColorClass = getPlanColor(subtitle)

  return (
    <article aria-labelledby={`company-${id || 'company'}`} className="company-card relative bg-white rounded-2xl border border-slate-100 px-4 py-4 h-[180px] flex flex-col shadow-[0_4px_18px_rgba(2,6,23,0.03)] transition">
      {/* Avatar - Centered */}
      <div className="flex flex-col items-center mb-2">
        <div className={`w-12 h-12 ${colorClass} rounded-[12px] shadow-[0_6px_18px_rgba(2,6,23,0.04)] flex items-center justify-center text-white font-bold text-xl mb-2`}>
          {firstLetter}
        </div>
        <h3 id={`company-${id || 'company'}`} className="text-xs font-extrabold text-slate-900 text-center mb-0.5">{name}</h3>
        {subtitle && subtitle.toLowerCase() !== 'free' ? (
          <p className="text-[10px] text-slate-500 normal-case">{subtitle}</p>
        ) : null}
      </div>

      {/* Plan Badge */}
      <div className="flex justify-center mb-1">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium normal-case ${planColorClass}`}>
          {subtitle || 'Free'}
        </span>
      </div>

      {/* Team Info and Status */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 mb-3">
        <span className="flex items-center gap-1">
          <span className="text-slate-400 font-normal">Team:</span>
          <span className="font-semibold text-slate-700">{typeof members === 'number' ? members : 0}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-emerald-600">Active</span>
        </span>
      </div>

      {/* Footer: Open Books button */}
      <button onClick={(e) => { e.stopPropagation(); onLaunch ? onLaunch() : router.push(`/companies/${id || ''}`) }} className="absolute left-4 right-4 -bottom-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition text-xs">
        Open Books
      </button>
    </article>
  )
}
