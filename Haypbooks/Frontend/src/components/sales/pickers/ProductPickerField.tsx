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

// Raw response shape may vary depending on API; keep properties optional and loosely typed.
interface RawProduct {
  id?: unknown
  name?: unknown
  type?: unknown
  sku?: unknown
  description?: unknown
  salesPrice?: unknown
  taxRate?: unknown
  taxCodeId?: unknown
}

function normalizeItems(payload: unknown): RawProduct[] {
  const p = payload as Record<string, unknown> | undefined
  if (Array.isArray(payload)) return payload as RawProduct[]
  if (Array.isArray(p?.items)) return p!.items as RawProduct[]
  if (Array.isArray(p?.data)) return p!.data as RawProduct[]
  if (Array.isArray(p?.results)) return p!.results as RawProduct[]
  return []
}

function normalizeItem(item: RawProduct): ProductPickerItem {
  return {
    id: String(item?.id ?? ''),
    name: String(item?.name ?? 'Unnamed item'),
    type: String(item?.type ?? ''),
    sku: (item?.sku ?? null) as string | null,
    description: item?.description as string | undefined,
    salesPrice: item?.salesPrice != null ? Number(item.salesPrice as any) : null,
    taxRate: item?.taxRate != null ? Number(item.taxRate as any) : undefined,
    taxCodeId: (item?.taxCodeId ?? null) as string | null,
  }
}

function mapItemToOption(item: RawProduct): PickerOption {
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