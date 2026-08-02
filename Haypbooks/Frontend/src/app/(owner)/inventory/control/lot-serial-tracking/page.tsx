'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { QrCode, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

export default function LotSerialTrackingPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [lotSerial, setLotSerial] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOT' | 'SERIAL'>('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const [lotSerialRes, itemsRes, locationsRes] = await Promise.all([
        inventoryService.listLotSerial(companyId),
        inventoryService.listItems(companyId),
        inventoryService.listLocations(companyId),
      ])

      const lotSerialData = Array.isArray(lotSerialRes.data)
        ? lotSerialRes.data
        : (lotSerialRes.data?.data ?? [])
      const itemsData = itemsRes.data?.data ?? []
      const locationsData = Array.isArray(locationsRes.data)
        ? locationsRes.data
        : (locationsRes.data?.data ?? [])

      setLotSerial(lotSerialData)
      setItems(itemsData)
      setLocations(locationsData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load lot and serial records')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchData()
  }, [companyId, companyLoading, fetchData])

  const itemMap = useMemo(
    () => new Map(items.map((i: any) => [i.id, i.name])),
    [items],
  )

  const warehouseMap = useMemo(
    () => new Map(locations.map((l: any) => [l.id, l.name])),
    [locations],
  )

  const filtered = useMemo(() => {
    return lotSerial.filter((item: any) => {
      const itemName = itemMap.get(item.itemId) || ''
      const lotOrSerial = item.lotNumber || item.serialNumber || ''
      const matchesSearch = !search ||
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        lotOrSerial.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [lotSerial, search, typeFilter, itemMap])

  const now = new Date()

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="w-6 h-6 text-emerald-600" />
        <h2 className="text-lg font-semibold text-slate-800">Lot / Serial Tracking</h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by item name, lot or serial number..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'LOT', 'SERIAL'].map((option) => {
            const active = typeFilter === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTypeFilter(option as 'ALL' | 'LOT' | 'SERIAL')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ITEM NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">LOT / SERIAL #</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">QTY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">QTY ON HAND</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">WAREHOUSE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">EXPIRY DATE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No lot or serial records found
                </td>
              </tr>
            ) : (
              filtered.map((item: any) => {
                const lotOrSerial = item.lotNumber || item.serialNumber || '—'
                const quantity = Number(item.quantity || 0)
                const quantityOnHand = Number(item.quantityOnHand || 0)
                const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null
                const expiryText = expiryDate ? format(expiryDate, 'MMM d, yyyy') : '—'
                let expiryClass = 'text-slate-600'

                if (!expiryDate) {
                  expiryClass = 'text-slate-400'
                } else if (expiryDate < now) {
                  expiryClass = 'text-rose-600 font-medium'
                } else if (expiryDate <= new Date(now.getTime() + 90 * 86400000)) {
                  expiryClass = 'text-amber-600'
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{itemMap.get(item.itemId) || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.type === 'LOT' ? 'bg-blue-50 text-blue-700' : item.type === 'SERIAL' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {item.type || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{lotOrSerial}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{quantityOnHand.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.warehouseId ? warehouseMap.get(item.warehouseId) || '—' : '—'}</td>
                    <td className={`px-4 py-3 text-sm ${expiryClass}`}>{expiryText}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600">
                        {item.status || '—'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
