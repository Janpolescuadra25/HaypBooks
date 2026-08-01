'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Plus, Percent, Tag, X } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService, type TaxRate, type TaxCode } from '@/services/tax.service'

const TAX_TYPE_OPTIONS = ['VAT', 'GST', 'SALES_TAX', 'WITHHOLDING', 'EXCISE', 'CUSTOM']

type Tab = 'rates' | 'codes'

export default function TaxRatesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()

  const [activeTab, setActiveTab] = useState<Tab>('rates')
  const [rates, setRates] = useState<TaxRate[]>([])
  const [codes, setCodes] = useState<TaxCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showRateModal, setShowRateModal] = useState(false)
  const [rateForm, setRateForm] = useState({ name: '', rate: '', taxType: 'VAT', effectiveFrom: '', effectiveTo: '' })
  const [rateSubmitting, setRateSubmitting] = useState(false)
  const [rateModalError, setRateModalError] = useState<string | null>(null)

  const [showCodeModal, setShowCodeModal] = useState(false)
  const [codeForm, setCodeForm] = useState({ code: '', name: '', isDefault: false })
  const [codeSubmitting, setCodeSubmitting] = useState(false)
  const [codeModalError, setCodeModalError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const [ratesRes, codesRes] = await Promise.all([
        taxService.listRates(companyId),
        taxService.listCodes(companyId),
      ])
      const ratesData = ratesRes.data
      const codesData = codesRes.data
      setRates(Array.isArray(ratesData) ? ratesData : (ratesData?.data ?? []))
      setCodes(Array.isArray(codesData) ? codesData : (codesData?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchData()
  }, [companyLoading, companyId, fetchData])

  const handleCreateRate = async () => {
    if (!companyId || !rateForm.name || !rateForm.rate || !rateForm.effectiveFrom) return
    setRateModalError(null)
    setRateSubmitting(true)
    try {
      await taxService.createRate(companyId, {
        name: rateForm.name,
        rate: Number(rateForm.rate),
        taxType: rateForm.taxType,
        effectiveFrom: rateForm.effectiveFrom,
        effectiveTo: rateForm.effectiveTo || undefined,
      })
      setShowRateModal(false)
      setRateForm({ name: '', rate: '', taxType: 'VAT', effectiveFrom: '', effectiveTo: '' })
      fetchData()
    } catch (err: any) {
      setRateModalError(err?.response?.data?.message || err?.message || 'Failed to create tax rate')
    } finally {
      setRateSubmitting(false)
    }
  }

  const handleCreateCode = async () => {
    if (!companyId || !codeForm.code || !codeForm.name) return
    setCodeModalError(null)
    setCodeSubmitting(true)
    try {
      await taxService.createCode(companyId, {
        code: codeForm.code,
        name: codeForm.name,
        isDefault: codeForm.isDefault,
      })
      setShowCodeModal(false)
      setCodeForm({ code: '', name: '', isDefault: false })
      fetchData()
    } catch (err: any) {
      setCodeModalError(err?.response?.data?.message || err?.message || 'Failed to create tax code')
    } finally {
      setCodeSubmitting(false)
    }
  }

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tax Rates & Codes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage tax rates and tax codes for your company</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('rates')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rates' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Tax Rates
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'codes' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Tax Codes
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="text-sm mb-2">{error}</p>
          <button onClick={fetchData} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Retry</button>
        </div>
      ) : activeTab === 'rates' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Tax Rates</h2>
            <button
              onClick={() => { setShowRateModal(true); setRateModalError(null) }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Tax Rate
            </button>
          </div>
          {rates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Percent className="h-8 w-8 mb-2 text-slate-300" />
              <p className="text-sm">No tax rates configured</p>
              <p className="text-xs mt-1">Click "Add Tax Rate" to create your first tax rate</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Effective From</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Effective To</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{rate.name}</td>
                      <td className="px-5 py-3 text-slate-700">{Number(rate.rate).toFixed(2)}%</td>
                      <td className="px-5 py-3">
                        {rate.taxType ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{rate.taxType}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{rate.effectiveFrom ? new Date(rate.effectiveFrom).toISOString().slice(0, 10) : '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{rate.effectiveTo ? new Date(rate.effectiveTo).toISOString().slice(0, 10) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Tax Codes</h2>
            <button
              onClick={() => { setShowCodeModal(true); setCodeModalError(null) }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Tax Code
            </button>
          </div>
          {codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Tag className="h-8 w-8 mb-2 text-slate-300" />
              <p className="text-sm">No tax codes configured</p>
              <p className="text-xs mt-1">Click "Add Tax Code" to create your first tax code</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Default</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rates</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{code.code}</td>
                      <td className="px-5 py-3 text-slate-700">{code.name}</td>
                      <td className="px-5 py-3">
                        {code.isDefault ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Default</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">{code.rates?.length ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Tax Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowRateModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Add Tax Rate</h3>
              <button onClick={() => setShowRateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            {rateModalError && (
              <div className="mb-4 px-3 py-2 text-sm text-rose-700 bg-rose-50 rounded-lg">{rateModalError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={rateForm.name}
                  onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Standard VAT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rateForm.rate}
                  onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="12.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Type</label>
                <select
                  value={rateForm.taxType}
                  onChange={(e) => setRateForm({ ...rateForm, taxType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {TAX_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Effective From</label>
                <input
                  type="date"
                  value={rateForm.effectiveFrom}
                  onChange={(e) => setRateForm({ ...rateForm, effectiveFrom: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Effective To (optional)</label>
                <input
                  type="date"
                  value={rateForm.effectiveTo}
                  onChange={(e) => setRateForm({ ...rateForm, effectiveTo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRate}
                disabled={rateSubmitting || !rateForm.name || !rateForm.rate || !rateForm.effectiveFrom}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {rateSubmitting ? 'Creating...' : 'Create Tax Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tax Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCodeModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Add Tax Code</h3>
              <button onClick={() => setShowCodeModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            {codeModalError && (
              <div className="mb-4 px-3 py-2 text-sm text-rose-700 bg-rose-50 rounded-lg">{codeModalError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. VAT-STD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={codeForm.name}
                  onChange={(e) => setCodeForm({ ...codeForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Standard VAT 12%"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={codeForm.isDefault}
                  onChange={(e) => setCodeForm({ ...codeForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-sm text-slate-700">Set as default tax code</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCode}
                disabled={codeSubmitting || !codeForm.code || !codeForm.name}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {codeSubmitting ? 'Creating...' : 'Create Tax Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
