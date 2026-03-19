'use client'
import { BookOpen } from 'lucide-react'

const COLS = [
  {
    title: 'Product',
    links: ['Invoicing', 'Expenses', 'Inventory', 'Payroll', 'Insights'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Partners', 'Security'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Us', 'API Docs', 'Status', 'Changelog'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white/80">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">HaypBooks</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              The all-in-one business platform built for Philippine SMEs. Simplify, automate, and grow.
            </p>
            <div className="flex gap-3">
              {['fb', 'tw', 'li'].map(s => (
                <div key={s} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold cursor-default hover:bg-emerald-600 transition-colors">
                  {s === 'fb' ? 'f' : s === 'tw' ? 'X' : 'in'}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link}>
                    <span className="text-white/50 text-sm hover:text-emerald-400 transition-colors cursor-default">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 HaypBooks Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <span key={item} className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-default">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
