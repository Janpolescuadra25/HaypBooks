import apiClient from '@/lib/api-client'

export interface AuditLogLine {
  id: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changeType: string
  dataType?: string | null
  isSensitive: boolean
}

export interface AuditLogEntry {
  id: string
  companyId: string
  userId: string
  entityType: string
  entityId: string | null
  action: string
  changes?: any
  lines?: AuditLogLine[]
  metadata?: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
}

export interface GetCompanyAuditLogsParams {
  entityType?: string
  entityId?: string
  action?: string
  userId?: string
  search?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export async function getCompanyAuditLogs(companyId: string, params?: GetCompanyAuditLogsParams): Promise<{
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const searchParams = new URLSearchParams()
  if (params?.entityType) searchParams.set('entityType', params.entityType)
  if (params?.entityId) searchParams.set('entityId', params.entityId)
  if (params?.action) searchParams.set('action', params.action)
  if (params?.userId) searchParams.set('userId', params.userId)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  if (params?.page !== undefined) searchParams.set('page', String(params.page))
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))

  const query = searchParams.toString()
  const url = `/companies/${companyId}/audit-logs${query ? `?${query}` : ''}`
  const res = await apiClient.get(url)
  const response = res.data
  return {
    data: (response.data ?? []).map((item: any) => ({
      ...item,
      entityType: item.tableName ?? item.entityType,
      entityId: item.recordId ?? item.entityId,
    })),
    total: response.total ?? 0,
    page: response.page ?? 1,
    limit: response.limit ?? params?.limit ?? 50,
    totalPages: response.totalPages ?? Math.max(1, Math.ceil((response.total ?? 0) / (response.limit ?? params?.limit ?? 50))),
  }
}

export async function exportAuditLogs(companyId: string, params?: GetCompanyAuditLogsParams): Promise<Blob> {
  const searchParams = new URLSearchParams()
  if (params?.entityType) searchParams.set('entityType', params.entityType)
  if (params?.entityId) searchParams.set('entityId', params.entityId)
  if (params?.action) searchParams.set('action', params.action)
  if (params?.userId) searchParams.set('userId', params.userId)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  if (params?.page !== undefined) searchParams.set('page', String(params.page))
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))

  const query = searchParams.toString()
  const url = `/companies/${companyId}/audit-logs/export${query ? `?${query}` : ''}`
  const res = await apiClient.get(url, { responseType: 'blob' })
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
