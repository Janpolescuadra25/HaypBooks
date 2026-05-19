import apiClient from '@/lib/api-client'

export interface AuditLogEntry {
  id: string
  companyId: string
  userId: string
  entityType: string
  entityId: string
  action: string
  oldValue: any
  newValue: any
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export async function getCompanyAuditLogs(companyId: string, params?: {
  entityType?: string
  action?: string
  userId?: string
  startDate?: string
  endDate?: string
  skip?: number
  take?: number
}): Promise<{ items: AuditLogEntry[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.entityType) searchParams.set('entityType', params.entityType)
  if (params?.action) searchParams.set('action', params.action)
  if (params?.userId) searchParams.set('userId', params.userId)
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  if (params?.skip !== undefined) searchParams.set('skip', String(params.skip))
  if (params?.take !== undefined) searchParams.set('take', String(params.take))

  const query = searchParams.toString()
  const url = `/companies/${companyId}/audit-logs${query ? `?${query}` : ''}`
  const res = await apiClient.get(url)
  return res.data
}

export async function getEntityAuditHistory(
  companyId: string,
  entityType: string,
  entityId: string,
): Promise<AuditLogEntry[]> {
  const res = await apiClient.get(`/companies/${companyId}/audit-logs/${entityType}/${entityId}`)
  return res.data
}
