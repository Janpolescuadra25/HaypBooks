import React from 'react'
import ColumnResizer from './ColumnResizer'

type Props = {
  colKey: string
  width: number
  onChange: (colKey: string, next: number) => void
  min?: number
  className?: string
  children?: React.ReactNode
}

export default function ResizableColumn({ colKey, width, onChange, min = 40, className, children }: Props) {
  return (
    <th className={className}>
      <div className="relative h-full flex items-center gap-2 select-none" style={{ minHeight: 30 }}>
        <div className="truncate flex-1 text-left">{children}</div>
        {/* header resizer handle */}
        <ColumnResizer colKey={colKey} width={width} onChange={onChange} min={min} />
      </div>
    </th>
  )
}
