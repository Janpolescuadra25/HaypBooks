import { useState, useEffect, FormEvent } from 'react'
import { Shield, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const PERMISSION_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'bills', label: 'Bills & Payments' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'User Management' },
  { key: 'fixed_assets', label: 'Fixed Assets' },
  { key: 'tax', label: 'Tax Management' },
  { key: 'journal_entries', label: 'Journal Entries' },
]

export default function RolesPermissionsPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await settingsService.getRoles(companyId)
      setRoles(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const emptyPermissions = () =>
    PERMISSION_OPTIONS.reduce((acc, perm) => ({ ...acc, [perm.key]: false }), {})

  const handleCreate = () => {
    setEditingItem(null)
    setRoleName('')
    setDescription('')
    setActive(true)
    setPermissions(emptyPermissions())
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setRoleName(item.name || '')
    setDescription(item.description || '')
    setActive(item.active ?? true)
    setPermissions(item.permissions || emptyPermissions())
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!roleName.trim()) {
      setErrorMessage('Role Name is required.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        name: roleName,
        description,
        active,
        permissions,
      }
      if (editingItem) {
        await settingsService.updateRole(companyId, editingItem.id, payload)
      } else {
        await settingsService.createRole(companyId, payload)
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this role?')) return
    setLoading(true)
    try {
      await settingsService.deleteRole(companyId, item.id)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete role')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (key: string) => {
    setPermissions((current) => ({ ...current, [key]: !current[key] }))
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
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Roles & Permissions</h2>
            <p className="mt-1 text-sm text-slate-500">Define roles and configure permission access</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Create Role
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ROLE NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DESCRIPTION</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">USERS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                  No roles configured
                </td>
              </tr>
            ) : (
              roles.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-xs">{item.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.userCount ?? 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <HaypModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Role' : 'Create Role'}
        subtitle={editingItem ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
        size="lg"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="border-t border-slate-100 mt-6 mb-4"></div>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PERMISSION_OPTIONS.map((permission) => (
                <div key={permission.key} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <span className="text-sm text-slate-700">{permission.label}</span>
                  <button
                    type="button"
                    onClick={() => togglePermission(permission.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${permissions[permission.key] ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions[permission.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="inline-flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </span>
                ) : (
                  editingItem ? 'Save Changes' : 'Create Role'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
