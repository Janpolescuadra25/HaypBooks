export interface PickerOption {
  id: string
  primaryLabel: string
  secondaryLabel?: string
  tertiaryLabel?: string
}

export interface PickerProps {
  companyId: string
  value: string | null
  onChange: (id: string, option: PickerOption) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  filters?: Record<string, string>
  error?: string
  className?: string
  testId?: string
}