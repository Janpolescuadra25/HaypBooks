import apiClient from '@/lib/api-client'

export interface RecurringExpenseFilters {
  status?: string
  vendorId?: string
  skip?: number
  take?: number
}

export async function listRecurringExpenses(companyId: string, filters?: RecurringExpenseFilters) {
  return apiClient.get(`/companies/${companyId}/recurring-expenses`, { params: filters })
}

export async function getRecurringExpense(companyId: string, id: string) {
  return apiClient.get(`/companies/${companyId}/recurring-expenses/${id}`)
}

export async function createRecurringExpense(companyId: string, data: any) {
  return apiClient.post(`/companies/${companyId}/recurring-expenses`, data)
}

export async function updateRecurringExpense(companyId: string, id: string, data: any) {
  return apiClient.patch(`/companies/${companyId}/recurring-expenses/${id}`, data)
}

export async function cancelRecurringExpense(companyId: string, id: string) {
  return apiClient.post(`/companies/${companyId}/recurring-expenses/${id}/cancel`)
}
