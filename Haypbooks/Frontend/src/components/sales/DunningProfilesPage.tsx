'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react'
import { salesService, DunningProfile, DunningStep } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'

type DunningStepForm = DunningStep & { isNew?: boolean }

type ModalMode = 'create' | 'edit'

function formatDate(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function createEmptyStep(profileId: string): DunningStepForm {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    profileId,
    dayOffset: 0,
    channel: 'Email',
    templateKey: '',
    isActive: true,
    isNew: true,
  }
}

function stepIsEqual(a: DunningStepForm, b: DunningStepForm) {
  return a.dayOffset === b.dayOffset && a.channel === b.channel && a.templateKey === b.templateKey && a.isActive === b.isActive
}

export default function DunningProfilesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()

  const [profiles, setProfiles] = useState<DunningProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [activeProfile, setActiveProfile] = useState<DunningProfile | null>(null)
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [steps, setSteps] = useState<DunningStepForm[]>([])
  const [saving, setSaving] = useState(false)

  const fetchProfiles = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.getDunningProfiles(companyId)
      const data = response.data as DunningProfile[]
      setProfiles(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load dunning profiles')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const openCreateModal = () => {
    setModalMode('create')
    setActiveProfile(null)
    setName('')
    setIsActive(true)
    setSteps([])
    setModalOpen(true)
  }

  const openEditModal = (profile: DunningProfile) => {
    setModalMode('edit')
    setActiveProfile(profile)
    setName(profile.name)
    setIsActive(profile.isActive)
    setSteps(profile.steps.map((step) => ({ ...step, isNew: false })))
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setActiveProfile(null)
    setSteps([])
  }

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.dayOffset - b.dayOffset),
    [steps],
  )

  const addStep = () => {
    setSteps((current) => [...current, createEmptyStep(activeProfile?.id ?? '')])
  }

  const updateStep = (id: string, patch: Partial<DunningStepForm>) => {
    setSteps((current) => current.map((step) => step.id === id ? { ...step, ...patch } : step))
  }

  const removeStep = (id: string) => {
    setSteps((current) => current.filter((step) => step.id !== id))
  }

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Profile name is required')
      return false
    }
    for (const step of steps) {
      if (!step.templateKey.trim()) {
        toast.error('All steps need a template key')
        return false
      }
      if (step.dayOffset < 0) {
        toast.error('Step day offset cannot be negative')
        return false
      }
    }
    return true
  }

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!companyId) return
    if (!validateForm()) return
    setSaving(true)

    try {
      let profile: DunningProfile
      if (modalMode === 'create') {
        const response = await salesService.createDunningProfile(companyId, { name: name.trim(), isActive })
        profile = response.data
      } else {
        const response = await salesService.updateDunningProfile(companyId, activeProfile!.id, { name: name.trim(), isActive })
        profile = response.data
      }

      const existingSteps = modalMode === 'edit' ? activeProfile?.steps ?? [] : []
      const currentStepMap = new Map(steps.map((step) => [step.id, step]))
      const existingStepIds = new Set(existingSteps.map((step) => step.id))
      const currentExistingSteps = steps.filter((step) => !step.isNew)
      const deletedStepIds = existingSteps.filter((step) => !currentStepMap.has(step.id)).map((step) => step.id)

      for (const stepId of deletedStepIds) {
        await salesService.deleteDunningStep(companyId, profile.id, stepId)
      }

      for (const step of steps) {
        const payload = {
          dayOffset: step.dayOffset,
          channel: step.channel,
          templateKey: step.templateKey.trim(),
          isActive: step.isActive,
        }

        if (step.isNew) {
          await salesService.createDunningStep(companyId, profile.id, payload)
          continue
        }

        const originalStep = existingSteps.find((existing) => existing.id === step.id)
        if (originalStep && !stepIsEqual(originalStep, step)) {
          await salesService.updateDunningStep(companyId, profile.id, step.id, payload)
        }
      }

      toast.success(modalMode === 'create' ? 'Dunning profile created' : 'Dunning profile updated')
      fetchProfiles()
      closeModal()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save dunning profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = async (profile: DunningProfile) => {
    if (!companyId) return
    if (!window.confirm(`Delete dunning profile "${profile.name}"?`)) return
    try {
      await salesService.deleteDunningProfile(companyId, profile.id)
      toast.success('Dunning profile deleted')
      fetchProfiles()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete profile')
    }
  }

  const columns = useMemo<HaypColumn<DunningProfile>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      render: (value: any) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      id: 'steps',
      header: 'Steps',
      render: (_value: any, row: DunningProfile) => {
        const activeSteps = row.steps.filter((step) => step.isActive).length
        return <span className="text-slate-700">{activeSteps} step{activeSteps === 1 ? '' : 's'}</span>
      },
    },
    {
      id: 'status',
      header: 'Status',
      render: (_value: any, row: DunningProfile) => (
        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${row.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      render: (value: any) => <span className="text-slate-700">{formatDate(value)}</span>,
    },
  ], [])

  const rowActions = useMemo<HaypActionItem[]>(
    () => [
      {
        label: 'Edit',
        icon: <Edit2 size={14} />,
        onClick: (_rowId, row) => openEditModal(row as DunningProfile),
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: (_rowId, row) => handleDeleteProfile(row as DunningProfile),
      },
    ],
    [handleDeleteProfile],
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpDown size={22} className="text-emerald-600" />
              Dunning Profiles
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage dunning profiles and their step sequences for automated collections.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
          >
            <Plus size={14} />
            New Profile
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <HaypDataTable
          tableId="dunning-profiles"
          data={profiles}
          columns={columns}
          actions={rowActions}
          loading={loading || companyLoading}
          emptyTitle="No dunning profiles yet"
          emptySubtitle="Create a profile to configure automatic collection steps"
          onRefresh={fetchProfiles}
          className="bg-white rounded-xl border border-slate-200"
        />
      </div>

      {modalOpen && (
        <HaypModal
          open={modalOpen}
          onClose={closeModal}
          title={modalMode === 'create' ? 'New Dunning Profile' : 'Edit Dunning Profile'}
          size="md"
        >
          <form onSubmit={submitProfile} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Standard Collections"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="profile-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="profile-active" className="text-sm text-slate-700">Active</label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Steps</h2>
                  <p className="text-xs text-slate-500">Order steps by days past due and configure notification channels.</p>
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                >
                  <Plus size={14} />
                  Add Step
                </button>
              </div>

              <div className="space-y-3">
                {sortedSteps.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    No steps yet. Add a step to define your dunning sequence.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSteps.map((step) => (
                      <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100">
                        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                          <div>
                            <label className="block text-xs font-medium text-slate-600">Day Offset</label>
                            <input
                              type="number"
                              min={0}
                              value={step.dayOffset}
                              onChange={(event) => updateStep(step.id, { dayOffset: Number(event.target.value) })}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600">Channel</label>
                            <select
                              value={step.channel}
                              onChange={(event) => updateStep(step.id, { channel: event.target.value })}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              <option value="Email">Email</option>
                              <option value="SMS">SMS</option>
                              <option value="Letter">Letter</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr] mt-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-600">Template Key</label>
                            <input
                              value={step.templateKey}
                              onChange={(event) => updateStep(step.id, { templateKey: event.target.value })}
                              placeholder="e.g. DUNNING_EMAIL_1"
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                id={`step-active-${step.id}`}
                                type="checkbox"
                                checked={step.isActive}
                                onChange={(event) => updateStep(step.id, { isActive: event.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <label htmlFor={`step-active-${step.id}`} className="text-sm text-slate-700">Active</label>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStep(step.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : modalMode === 'create' ? 'Create Profile' : 'Save Changes'}
              </button>
            </div>
          </form>
        </HaypModal>
      )}
    </div>
  )
}
