'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const options = [
    {
      key: 'business',
      title: 'I run a business',
      desc: 'I manage my own books and run a single company.',
      action: '/auth/signup?role=business'
    },
    {
      key: 'accountant',
      title: 'I am an accountant or bookkeeper',
      desc: 'I manage books for multiple clients and want the accountant tools.',
      action: '/auth/signup?role=accountant'
    },
    {
      key: 'both',
      title: "I do both",
      desc: 'I own a business and also manage books for clients.',
      action: '/auth/signup?role=both'
    }
  ]

  function choose(key: string, actionHref: string) {
    // persist selection for later steps
    if (typeof window !== 'undefined') localStorage.setItem('preferred_role', key)
    // If user wants to go to signup, pass the role on the query param as well
    router.push(actionHref)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-white px-4 py-24">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">What best describes you?</h1>
        <p className="text-lg text-slate-600 mb-8">We’ll tailor the HaypBooks experience for you. You can change this anytime in settings.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => choose(opt.key, opt.action)}
              className={`group relative p-6 bg-white rounded-2xl shadow-lg border transition-transform transform hover:-translate-y-1 focus:outline-none ${selected === opt.key ? 'ring-4 ring-emerald-200' : ''}`}
              aria-pressed={selected === opt.key}
            >
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                <p className="text-sm text-slate-500">{opt.desc}</p>
              </div>
              <div className="absolute right-4 top-4 text-teal-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Choose →</div>
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
