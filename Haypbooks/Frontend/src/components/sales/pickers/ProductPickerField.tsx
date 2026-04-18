'use client'

import BaseSearchablePicker from './BaseSearchablePicker'
import type { PickerOption, PickerProps } from './types'

interface ProductPickerFieldProps extends PickerProps {
  itemType?: 'PRODUCT' | 'SERVICE' | string
  onAddNew?: () => void
  createLabel?: string
}

function normalizeItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

function mapItemToOption(item: any): PickerOption {
  const id = String(item?.id ?? '')
  const primaryLabel = String(item?.name ?? 'Unnamed item')
  const secondaryLabel = item?.sku || item?.type || undefined
  const tertiaryLabel = item?.salesPrice != null ? Number(item.salesPrice).toLocaleString() : undefined
  return { id, primaryLabel, secondaryLabel, tertiaryLabel }
}

export default function ProductPickerField({ itemType, filters, ...props }: ProductPickerFieldProps) {
  const mergedFilters = {
    ...(filters ?? {}),
    ...(itemType ? { type: itemType } : {}),
  }

  return (
    <BaseSearchablePicker
      {...props}
      filters={mergedFilters}
      emptyMessage="No products or services found"
      searchEndpoint={(cid, search, nextFilters) => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', '20')
        if (nextFilters?.type) params.set('type', nextFilters.type)
        return `/companies/${cid}/inventory/items?${params.toString()}`
      }}
      mapResponseToOptions={(responseData) => normalizeItems(responseData).map(mapItemToOption)}
    />
  )
}