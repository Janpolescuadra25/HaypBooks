type Align = 'left' | 'center' | 'right'

type SimpleCol = {
  label: string
  align?: Align
}

type Group = {
  label: string
  subLabels: string[]
  align?: Align
}

export function CompareHeader(props: {
  fixed: { label: string; align?: Align }
  columns?: SimpleCol[]
  groups?: Group[]
  className?: string
}) {
  const { fixed, columns, groups, className } = props
  const thBase = 'px-3 py-2'
  const alignClass = (a?: Align) => (a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center')

  if (!groups || groups.length === 0) {
    // Simple one-row header
    return (
      <thead className={className}>
        <tr>
          <th className={`${thBase} ${alignClass(fixed.align)}`}>{fixed.label}</th>
          {(columns || []).map((c, i) => (
            <th key={i} className={`${thBase} ${alignClass(c.align)}`}>{c.label}</th>
          ))}
        </tr>
      </thead>
    )
  }

  // Two-row grouped header
  return (
    <thead className={className}>
      <tr>
        <th className={`${thBase} ${alignClass(fixed.align)}`} rowSpan={2}>{fixed.label}</th>
        {groups.map((g, i) => (
          <th key={i} className={`${thBase} ${alignClass(g.align)}`} colSpan={g.subLabels.length} scope="colgroup">{g.label}</th>
        ))}
      </tr>
      <tr>
        {groups.flatMap((g, gi) => (
          g.subLabels.map((s, si) => (
            <th key={`${gi}-${si}`} className={`${thBase} ${alignClass(g.align)}`} scope="col">{s}</th>
          ))
        ))}
      </tr>
    </thead>
  )
}
