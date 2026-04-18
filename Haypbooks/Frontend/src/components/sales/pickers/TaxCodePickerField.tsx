'use client'

import BaseSearchablePicker from './BaseSearchablePicker'
import type { PickerOption, PickerProps } from './types'

function normalizeTaxCodes(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.codes)) return payload.codes
  return []
}

function formatRateLabel(code: any): string | undefined {
  const rawRate = code?.rates?.[0]?.ratePct
  if (rawRate == null) return undefined
  return `${Number(rawRate).toLocaleString()}%`
}

function mapTaxCodeToOption(code: any): PickerOption {
  const id = String(code?.id ?? '')
  const codeValue = String(code?.code ?? '').trim()
  const nameValue = String(code?.name ?? '').trim()
  const primaryLabel = codeValue || nameValue || 'Unnamed tax code'
  const secondaryLabel = formatRateLabel(code)
  const tertiaryLabel = code?.isDefault ? 'Default' : undefined
  return {
    id,
    primaryLabel,
    secondaryLabel,
    tertiaryLabel,
  }
}

export default function TaxCodePickerField(props: PickerProps) {
  return (
    <BaseSearchablePicker
      {...props}
      compact={true}
      emptyMessage="No tax codes found"
      searchEndpoint={(cid, search) => {
        const params = new URLSearchParams()
        params.set('search', search)
        return `/companies/${cid}/tax/codes?${params.toString()}`
      }}
      mapResponseToOptions={(responseData) => normalizeTaxCodes(responseData).map(mapTaxCodeToOption)}
    />
  )
}