'use client'

import BaseSearchablePicker from './BaseSearchablePicker'
import type { PickerOption, PickerProps } from './types'

interface InvoicePickerFieldProps extends PickerProps {
  customerId?: string
  statuses?: string
}

function normalizeInvoices(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.invoices)) return payload.invoices
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function getCustomerName(invoice: any): string | undefined {
  return (
    invoice?.customerName ??
    invoice?.customer?.name ??
    invoice?.customer?.contact?.displayName ??
    undefined
  )
}

function getBalanceValue(invoice: any): number {
  const raw =
    invoice?.balance ??
    invoice?.amountDue ??
    invoice?.outstandingAmount ??
    0
  return Number(raw) || 0
}

function mapInvoiceToOption(invoice: any): PickerOption {
  const id = String(invoice?.id ?? '')
  const primaryLabel = String(invoice?.invoiceNumber ?? invoice?.id ?? 'Unknown invoice')
  const secondaryLabel = getCustomerName(invoice)
  const tertiaryLabel = `${getBalanceValue(invoice).toLocaleString()} due`
  return { id, primaryLabel, secondaryLabel, tertiaryLabel }
}

export default function InvoicePickerField({ customerId, statuses, filters, ...props }: InvoicePickerFieldProps) {
  const mergedFilters = {
    ...(filters ?? {}),
    ...(customerId ? { customerId } : {}),
    ...(statuses ? { status: statuses } : {}),
  }

  return (
    <BaseSearchablePicker
      {...props}
      filters={mergedFilters}
      emptyMessage="No invoices found"
      searchEndpoint={(cid, search, nextFilters) => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', '20')
        if (nextFilters?.customerId) params.set('customerId', nextFilters.customerId)
        if (nextFilters?.status) params.set('status', nextFilters.status)
        return `/companies/${cid}/ar/invoices?${params.toString()}`
      }}
      mapResponseToOptions={(responseData) => normalizeInvoices(responseData).map(mapInvoiceToOption)}
    />
  )
}