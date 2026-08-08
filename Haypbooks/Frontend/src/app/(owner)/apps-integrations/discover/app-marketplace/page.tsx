import { useState, useEffect } from 'react'
import { Search, RefreshCw, Loader2, Plus } from 'lucide-react'
import { integrationService } from '@/services/integration.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const CATEGORIES = ['All', 'Accounting', 'Payment', 'CRM', 'Storage', 'Communication', 'Productivity']
const CARD_COLORS = ['bg-blue-50 text-blue-700', 'bg-emerald-50 text-emerald-700', 'bg-purple-50 text-purple-700', 'bg-amber-50 text-amber-700', 'bg-rose-50 text-rose-700', 'bg-cyan-50 text-cyan-700']

export default function AppMarketplacePage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await integrationService.getMarketplaceApps(companyId)
      setApps(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load marketplace apps' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 3000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name?.toLowerCase().includes(search.toLowerCase()) || app.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || app.category === category
    return matchesSearch && matchesCategory
  })

  const handleInstall = async (app: any) => {
    if (!companyId) return
    setLoading(true)
    try {
      await integrationService.installApp(companyId, { name: app.name, category: app.category })
      setFeedback({ type: 'success', message: 'App installed successfully' })
      await fetchData()
      setSelectedApp(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to install app' })
    } finally {
      setLoading(false)
    }
  }

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {companyIdError}
        </div>
      </div>
    )
  }

  if (companyIdLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Search className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">App Marketplace</h2>
            <p className="mt-1 text-sm text-slate-500">Discover and install integrations for your workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search apps..."
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${category === item ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`rounded-2xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {feedback.message}
        </div>
      )}

      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No apps found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app, index) => (
            <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${CARD_COLORS[index % CARD_COLORS.length]}`}>
                <span className="text-lg font-semibold">{app.name?.charAt(0) || 'A'}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{app.name}</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">{app.description}</p>
              <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{app.category}</span>
              <div className="mt-6 flex-grow" />
              <button
                type="button"
                onClick={() => setSelectedApp(app)}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${app.installed ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                disabled={app.installed}
              >
                {app.installed ? 'Installed' : 'Install'}
              </button>
            </div>
          ))}
        </div>
      )}

      <HaypModal
        open={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.name || ''}
        subtitle={selectedApp?.category || ''}
        size="md"
        closeOnOverlayClick={true}
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${CARD_COLORS[apps.findIndex((item) => item.id === selectedApp.id) % CARD_COLORS.length]}`}>
                <span className="text-2xl font-semibold">{selectedApp.name?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">{selectedApp.description}</p>
                <div className="mt-3 text-sm text-slate-700">Category: {selectedApp.category}</div>
                <div className="text-sm text-slate-700">Version: {selectedApp.version}</div>
                <div className="text-sm text-slate-700">Developer: {selectedApp.developer}</div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => selectedApp && handleInstall(selectedApp)}
                disabled={selectedApp.installed}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${selectedApp.installed ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {selectedApp.installed ? 'Installed' : 'Install'}
              </button>
            </div>
          </div>
        )}
      </HaypModal>
    </div>
  )
}
