'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'
import ExpenseDetailLayout, { DetailSection } from './ExpenseDetailLayout'
import { expensesService } from '@/services/expenses.service'

interface VendorDetail {
  id: string
  name?: string
  status?: string
  email?: string
  phone?: string
  website?: string
  primaryContact?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  paymentTerms?: string
  currency?: string
  creditLimit?: number
  taxId?: string
  withholdingRate?: number
  nonResident?: boolean
  billsCount?: number
  purchaseOrdersCount?: number
  creditCount?: number
}

const STATUS_COLOR_MAP: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  ACTIVE: 'green',
  PENDING: 'amber',
  APPROVED: 'blue',
  INACTIVE: 'gray',
  SUSPENDED: 'red',
  DRAFT: 'gray',
}

export default function VendorDetailPage({ vendorId: vendorIdProp }: { vendorId?: string }) {
  const vendorId = vendorIdProp ?? ''
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!companyId || !vendorId) return
    const companyIdValue = companyId as string
    const vendorIdValue = vendorId
    let active = true
    setLoading(true)
    setError('')

    async function fetchVendor() {
      try {
        const res = await expensesService.getVendor(companyIdValue, vendorIdValue)
        if (!active) return
        const data = res.data ?? res
        setVendor(data as VendorDetail)
      } catch (err) {
        console.error(err)
        if (!active) return
        setError('Unable to load vendor details')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetchVendor()
    return () => { active = false }
  }, [companyId, vendorId])

  const status = vendor?.status ?? 'Unknown'
  const statusColor = STATUS_COLOR_MAP[status] ?? 'gray'

  const contactSection: DetailSection = {
    title: 'Contact Information',
    rows: [
      { label: 'Email', value: vendor?.email ?? '—', type: 'text' },
      { label: 'Phone', value: vendor?.phone ?? '—', type: 'text' },
      { label: 'Website', value: vendor?.website ?? '—', type: 'text' },
      { label: 'Primary Contact', value: vendor?.primaryContact ?? '—', type: 'text' },
    ],
  }

  const addressSection: DetailSection = {
    title: 'Address',
    rows: [
      { label: 'Street', value: vendor?.addressLine1 ?? '—', type: 'text' },
      { label: 'Street 2', value: vendor?.addressLine2 ?? '—', type: 'text' },
      { label: 'City', value: vendor?.city ?? '—', type: 'text' },
      { label: 'State', value: vendor?.state ?? '—', type: 'text' },
      { label: 'Postal Code', value: vendor?.postalCode ?? '—', type: 'text' },
      { label: 'Country', value: vendor?.country ?? '—', type: 'text' },
    ],
  }

  const financialSection: DetailSection = {
    title: 'Financial',
    rows: [
      { label: 'Payment Terms', value: vendor?.paymentTerms ?? '—', type: 'text' },
      { label: 'Default Currency', value: vendor?.currency ?? currency, type: 'text' },
      { label: 'Credit Limit', value: vendor?.creditLimit ?? 0, type: 'currency', currencyCode: vendor?.currency || currency },
    ],
  }

  const taxSection: DetailSection = {
    title: 'Tax Settings',
    rows: [
      { label: 'Tax ID', value: vendor?.taxId ?? '—', type: 'text' },
      { label: 'Withholding Rate', value: vendor?.withholdingRate != null ? `${vendor.withholdingRate}%` : '—', type: 'text' },
      { label: 'Non-resident', value: vendor?.nonResident ? 'Yes' : 'No', type: 'text' },
    ],
  }

  const relatedSection: DetailSection = {
    title: 'Related Records',
    rows: [
      { label: 'Bills', value: String(vendor?.billsCount ?? 0), type: 'text' },
      { label: 'Purchase Orders', value: String(vendor?.purchaseOrdersCount ?? 0), type: 'text' },
      { label: 'Vendor Credits', value: String(vendor?.creditCount ?? 0), type: 'text' },
    ],
  }

  const actions = [
    {
      label: 'New Vendor',
      icon: <Plus size={14} />,
      onClick: () => router.push('/expenses/procurement/vendors'),
      variant: 'default' as const,
      disabled: false,
    },
    {
      label: 'Edit',
      icon: <Edit2 size={14} />,
      onClick: () => router.push(`/expenses/procurement/vendors/${vendorId}/edit`),
      variant: 'primary' as const,
      disabled: !vendorId,
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: async () => {
        if (!companyId || !vendorId) return
        if (!window.confirm('Delete this vendor? This cannot be undone.')) return
        setDeleting(true)
        try {
          await expensesService.deleteVendor(companyId, vendorId)
          toast.success('Vendor deleted')
          router.push('/expenses/procurement/vendors')
        } catch (err) {
          console.error(err)
          toast.error('Failed to delete vendor')
        } finally {
          setDeleting(false)
        }
      },
      variant: 'danger' as const,
      disabled: deleting || !vendorId,
    },
  ]

  return (
    <ExpenseDetailLayout
      title={vendor?.name ?? 'Vendor Details'}
      subtitle={vendor?.email ?? ''}
      status={status}
      statusColor={statusColor}
      metadata={[
        { label: 'Vendor ID', value: vendor?.id ?? '—' },
      ]}
      sections={[contactSection, addressSection, financialSection, taxSection, relatedSection]}
      actions={actions}
      backUrl="/expenses/procurement/vendors"
      loading={loading || cidLoading}
      error={error}
    />
  )
}
