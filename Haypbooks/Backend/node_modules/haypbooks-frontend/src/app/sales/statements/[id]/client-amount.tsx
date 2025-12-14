"use client"
import { useCurrency } from '@/components/CurrencyProvider'

export default function Amount({ value }: { value: number }) {
  const { formatCurrency } = useCurrency()
  return <span>{formatCurrency(value)}</span>
}
