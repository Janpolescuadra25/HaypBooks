'use client'

import BaseSearchablePicker from './BaseSearchablePicker'
import type { PickerOption, PickerProps } from './types'

function normalizeAccounts(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.accounts)) return payload.accounts
  return []
}

function mapAccountToOption(account: any): PickerOption {
  const id = String(account?.id ?? '')
  const primaryLabel = String(account?.name ?? 'Unnamed account')
  const secondaryLabel = account?.institution || account?.accountNumber || undefined
  const tertiaryLabel = account?.isDefault ? 'Default' : undefined
  return { id, primaryLabel, secondaryLabel, tertiaryLabel }
}

export default function BankAccountPickerField(props: PickerProps) {
  return (
    <BaseSearchablePicker
      {...props}
      emptyMessage="No bank accounts found"
      searchEndpoint={(cid, search) => {
        const params = new URLSearchParams()
        params.set('search', search)
        return `/companies/${cid}/bank-accounts?${params.toString()}`
      }}
      mapResponseToOptions={(responseData) => normalizeAccounts(responseData).map(mapAccountToOption)}
    />
  )
}