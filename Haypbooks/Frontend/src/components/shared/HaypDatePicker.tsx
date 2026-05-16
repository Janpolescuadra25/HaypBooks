'use client'

interface HaypDatePickerProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  placeholder?: string
  className?: string
}

export default function HaypDatePicker({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  min,
  max,
  placeholder = 'Select date',
  className = '',
}: HaypDatePickerProps) {
  const normalizedValue = value?.includes('T') ? value.split('T')[0] : value

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type="date"
        value={normalizedValue}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      />
    </div>
  )
}
