/**
 * useCrud — All-in-one CRUD hook for Owner Hub pages.
 *
 * Combines: data fetching, modal state, form submission, and mutation.
 *
 * @example
 * const crud = useCrud<Customer>({
 *   endpoint: (companyId) => `/companies/${companyId}/customers`,
 *   fields: customerFields,
 * })
 *
 * // In your template:
 * //   onCreate={() => crud.openCreate()}
 * //   onRowClick={(row) => crud.openView(row)}
 * //   rowMenuItems={(row) => [
 * //     crud.viewAction(row),
 * //     crud.editAction(row),
 * //     crud.deleteAction(row),
 * //   ]}
 * //   <CrudModal {...crud.modalProps} />
 */
'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from './useCompanyId'
import type { CrudField } from '@/components/owner/CrudModal'

export interface UseCrudOptions<T = any> {
  /** API endpoint builder — receives companyId, returns URL path */
  endpoint: (companyId: string) => string
  /** Form field definitions */
  fields: CrudField[]
  /** Whether to fetch on mount */
  autoFetch?: boolean
  /** Transform API response to array */
  transform?: (data: any) => T[]
  /** Searchable fields for client-side search */
  searchableFields?: string[]
  /** Custom title for the entity */
  entityName?: string
}

export interface UseCrudResult<T = any> {
  // Data
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>

  // Modal
  modalOpen: boolean
  modalMode: 'create' | 'edit' | 'view' | 'delete'
  modalTitle: string
  editingRow: T | null
  openCreate: () => void
  openEdit: (row: T) => void
  openView: (row: T) => void
  openDelete: (row: T) => void
  closeModal: () => void

  // Submission
  saving: boolean
  submitForm: (data: Record<string, any>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>

  // Search
  search: string
  setSearch: (s: string) => void
  filteredData: T[]

  // Pagination
  pagination: { page: number; limit: number; total: number; totalPages: number } | null

  // Selection
  selectedIds: string[]
  toggleSelectAll: () => void
  toggleSelect: (id: string) => void
  clearSelection: () => void

  // Quick helpers for row menus
  viewAction: (row: T) => { label: string; icon: any; onClick: () => void }
  editAction: (row: T) => { label: string; icon: any; onClick: () => void }
  deleteAction: (row: T) => { label: string; icon: any; onClick: () => void; variant: string }

  // Config passthrough
  fields: CrudField[]
  entityName: string
}

export function useCrud<T extends Record<string, any> = any>(
  options: UseCrudOptions<T>
): UseCrudResult<T> {
  const {
    endpoint,
    fields,
    autoFetch = true,
    transform,
    searchableFields = [],
    entityName = 'Record',
  } = options

  const { companyId } = useCompanyId()

  // Data state
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'delete'>('create')
  const [editingRow, setEditingRow] = useState<T | null>(null)

  // Search state
  const [search, setSearch] = useState('')

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchWithRetries = useCallback(async (fn: () => Promise<any>, retries = 3, delayMs = 3000) => {
    let attempt = 0
    while (true) {
      try {
        return await fn()
      } catch (error: any) {
        const status = error?.response?.status
        if (status === 401) {
          throw error
        }
        if (status === 429 && attempt < retries) {
          attempt += 1
          await delay(delayMs)
          continue
        }
        throw error
      }
    }
  }, [])

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await fetchWithRetries(() => apiClient.get(endpoint(companyId)), 3, 3000)
      const items = transform ? transform(res) : Array.isArray(res) ? res : res?.items || res?.records || res?.data || []
      setData(items)
      setPagination(res?.pagination ?? null)
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError('Too many requests. Please try again after a few seconds.')
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }, [companyId, endpoint, transform, fetchWithRetries])

  useEffect(() => {
    if (autoFetch) fetchData()
    else setLoading(false)
  }, [fetchData, autoFetch])

  // Client-side search
  const filteredData = useMemo(() => {
    if (!search || searchableFields.length === 0) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      searchableFields.some(f => {
        const val = row[f]
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, searchableFields])

  // Modal controls
  const openCreate = useCallback(() => {
    setModalMode('create')
    setEditingRow(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((row: T) => {
    setModalMode('edit')
    setEditingRow(row)
    setModalOpen(true)
  }, [])

  const openView = useCallback((row: T) => {
    setModalMode('view')
    setEditingRow(row)
    setModalOpen(true)
  }, [])

  const openDelete = useCallback((row: T) => {
    setModalMode('delete')
    setEditingRow(row)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingRow(null)
  }, [])

  // Submit (create or update)
  const submitForm = useCallback(async (formData: Record<string, any>) => {
    setSaving(true)
    setError(null)
    try {
      if (modalMode === 'edit' && editingRow?.id) {
        await apiClient.put(`${endpoint(companyId)}/${editingRow.id}`, formData)
      } else {
        await apiClient.post(endpoint(companyId), formData)
      }
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
      throw err
    } finally {
      setSaving(false)
    }
  }, [modalMode, editingRow, companyId, endpoint, fetchData])

  // Delete
  const deleteRecord = useCallback(async (id: string) => {
    setSaving(true)
    setError(null)
    try {
      await apiClient.delete(`${endpoint(companyId)}/${id}`)
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed')
      throw err
    } finally {
      setSaving(false)
    }
  }, [companyId, endpoint, fetchData])

  // Selection
  const toggleSelectAll = useCallback(() => {
    const pageIds = filteredData.map(r => r.id)
    const allSelected = pageIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedIds([...new Set([...selectedIds, ...pageIds])])
    }
  }, [filteredData, selectedIds])

  const toggleSelect = useCallback((id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }, [selectedIds])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  // Modal title
  const modalTitle = useMemo(() => {
    if (modalMode === 'create') return `New ${entityName}`
    if (modalMode === 'edit') return `Edit ${entityName}`
    if (modalMode === 'view') return `${entityName} Details`
    if (modalMode === 'delete') return `Delete ${entityName}`
    return entityName
  }, [modalMode, entityName])

  // Row action helpers
  const { Eye, Pencil, Trash2 } = require('lucide-react')

  const viewAction = useCallback((row: T) => ({
    label: 'View',
    icon: <Eye size={14} />,
    onClick: () => openView(row),
  }), [openView])

  const editAction = useCallback((row: T) => ({
    label: 'Edit',
    icon: <Pencil size={14} />,
    onClick: () => openEdit(row),
  }), [openEdit])

  const deleteAction = useCallback((row: T) => ({
    label: 'Delete',
    icon: <Trash2 size={14} />,
    onClick: () => openDelete(row),
    variant: 'danger' as const,
  }), [openDelete])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    modalOpen,
    modalMode,
    modalTitle,
    editingRow,
    openCreate,
    openEdit,
    openView,
    openDelete,
    closeModal,
    saving,
    submitForm,
    deleteRecord,
    search,
    setSearch,
    filteredData,
    selectedIds,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    viewAction,
    editAction,
    deleteAction,
    pagination,
    fields,
    entityName,
  }
}
