'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { salesService, type ArCustomer, type PaymentTerm } from '@/services/sales.service'
import HaypModal from '@/components/shared/HaypModal'

interface CustomerFormModalProps {
  companyId: string
  customer: ArCustomer | null
  paymentTerms: PaymentTerm[]
  onClose: () => void
  onSaved: () => void
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'IE', label: 'Ireland' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'JP', label: 'Japan' },
  { value: 'SG', label: 'Singapore' },
  { value: 'KR', label: 'South Korea' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'PH', label: 'Philippines' },
  { value: 'AE', label: 'UAE' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'NZ', label: 'New Zealand' },
]

export default function CustomerFormModal({
  companyId,
  customer,
  paymentTerms,
  onClose,
  onSaved,
}: CustomerFormModalProps) {
  const toast = useToast()
  const isEdit = Boolean(customer)

  const [form, setForm] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    state: customer?.state ?? '',
    zip: customer?.zip ?? '',
    country: customer?.country ?? 'US',
    paymentTermId: customer?.paymentTermId ?? '',
    creditLimit: customer?.creditLimit != null ? String(customer.creditLimit) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
      city: customer?.city ?? '',
      state: customer?.state ?? '',
      zip: customer?.zip ?? '',
      country: customer?.country ?? 'US',
      paymentTermId: customer?.paymentTermId ?? '',
      creditLimit: customer?.creditLimit != null ? String(customer.creditLimit) : '',
    })
    setError('')
  }, [customer])

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Customer name is required.')
      return
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      displayName: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      zip: form.zip.trim() || undefined,
      country: form.country.trim() || undefined,
      paymentTermId: form.paymentTermId || undefined,
      creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
    }

    try {
      if (isEdit && customer?.id) {
        await salesService.updateArCustomer(companyId, customer.id, payload)
        toast.success('Customer updated')
      } else {
        await salesService.createArCustomer(companyId, payload)
        toast.success('Customer created')
      }
      onSaved()
    } catch (error: any) {
      setError(error?.response?.data?.message ?? 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HaypModal open={true} onClose={onClose} title={isEdit ? 'Edit Customer' : 'New Customer'} size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-emerald-700 mb-1">Name *</label>
          <Input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Full name or business name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="(555) 000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-emerald-700 mb-1">Street Address</label>
          <Input
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">City</label>
            <Input
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">State</label>
            <Input
              value={form.state}
              onChange={(e) => setField('state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">ZIP</label>
            <Input
              value={form.zip}
              onChange={(e) => setField('zip', e.target.value)}
              placeholder="ZIP"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-emerald-700 mb-1">Country</label>
          <select
            aria-label="Country"
            value={form.country}
            onChange={(e) => setField('country', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Payment Terms</label>
            <select
              aria-label="Payment Terms"
              value={form.paymentTermId}
              onChange={(e) => setField('paymentTermId', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">— None —</option>
              {paymentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Credit Limit</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.creditLimit}
              onChange={(e) => setField('creditLimit', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      </div>
    </HaypModal>
  )
}
