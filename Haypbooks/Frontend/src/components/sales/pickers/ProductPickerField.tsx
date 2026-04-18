'use client'

import BaseSearchablePicker from './BaseSearchablePicker'
import type { PickerOption, PickerProps } from './types'

export interface ProductPickerItem {
  id: string
  name: string
  type: string
  sku: string | null
  description?: string
  salesPrice: number | null
  taxRate?: number
  taxCodeId?: string | null
}

interface ProductPickerFieldProps extends PickerProps {
  itemType?: 'PRODUCT' | 'SERVICE' | string
  onAddNew?: () => void
  createLabel?: string
  onSelect?: (item: ProductPickerItem | null) => void
}

function normalizeItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

function normalizeItem(item: any): ProductPickerItem {
  return {
    id: String(item?.id ?? ''),
    name: String(item?.name ?? 'Unnamed item'),
    type: String(item?.type ?? ''),
    sku: item?.sku ?? null,
    description: item?.description ?? undefined,
    salesPrice: item?.salesPrice != null ? Number(item.salesPrice) : null,
    taxRate: item?.taxRate != null ? Number(item.taxRate) : undefined,
    taxCodeId: item?.taxCodeId ?? null,
  }
}

function mapItemToOption(item: any): PickerOption {
  const normalized = normalizeItem(item)
  return {
    id: normalized.id,
    primaryLabel: normalized.name,
    secondaryLabel: normalized.sku || normalized.type || undefined,
    tertiaryLabel: normalized.salesPrice != null ? Number(normalized.salesPrice).toLocaleString() : undefined,
    data: normalized,
  }
}

export default function ProductPickerField({ itemType, filters, onChange, onSelect, ...props }: ProductPickerFieldProps) {
  const mergedFilters = {
    ...(filters ?? {}),
    ...(itemType ? { type: itemType } : {}),
  }

  return (
    <BaseSearchablePicker
      {...props}
      onChange={(id, option) => {
        onChange(id, option)
        onSelect?.((option.data as ProductPickerItem | undefined) ?? null)
      }}
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