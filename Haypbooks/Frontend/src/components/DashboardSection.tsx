import { ReactNode } from 'react'

type Props = {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardSection({ title, actions, children, className }: Props) {
  return (
    <section className={`bar-section ${className || ''}`}>
      <div className="bar-slab">
        {(title || actions) && (
          <div className="flex items-center justify-between mb-2">
            {title ? <h2 className="text-xl font-semibold">{title}</h2> : <span />}
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
