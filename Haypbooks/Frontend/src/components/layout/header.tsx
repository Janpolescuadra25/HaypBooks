// Page header — title + action slots used inside route pages
import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
