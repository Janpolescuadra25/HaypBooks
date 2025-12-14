type Props = { value: string }

export default function StatusBadge({ value }: Props) {
  const v = (value || '').toLowerCase()
  const map: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Paid' },
    sent: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Sent' },
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' },
    overdue: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Overdue' },
  }
  const s = map[v] || map.draft
  return (
    <span className={`status-badge inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}
