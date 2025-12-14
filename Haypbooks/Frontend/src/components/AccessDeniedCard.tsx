"use client"

type Props = {
  title?: string
  message?: string
}

export function AccessDeniedCard({
  title = 'Access denied',
  message = 'You don’t have permission to view this content.'
}: Props) {
  return (
    <div className="glass-card border-red-200">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
          !
        </span>
        <div>
          <p className="font-medium text-red-700">{title}</p>
          <p className="text-slate-800 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  )
}
