"use client"

import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'

type Option = { key: string; label: string; required?: boolean }

export default function ClientColumnSettings({
  storageKey,
  options,
  defaultVisible,
}: {
  storageKey: string
  options: Option[]
  defaultVisible: string[]
}) {
  const [visible, setVisible] = usePersistedColumns(storageKey, defaultVisible)
  return <ColumnSettingsButton options={options} value={visible} onChange={setVisible} />
}
