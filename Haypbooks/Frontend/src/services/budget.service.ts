import apiClient from '@/lib/api-client'

export type BudgetScenario = 'ACTUAL' | 'BUDGET' | 'FORECAST' | 'WHAT_IF'
export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'LOCKED'

export interface Budget {
  id: string
  workspaceId: string
  name: string
  scenario: BudgetScenario
  status: BudgetStatus
  fiscalYear: number
  totalAmount: string | null
  createdAt: string
  _count?: { lines: number }
}

export const budgetService = {
  list: (companyId: string) =>
    apiClient.get<Budget[]>('/reporting/budgets', { params: { companyId } }),

  getById: (companyId: string, id: string) =>
    apiClient.get<Budget>(`/reporting/budgets/${id}`, { params: { companyId } }),

  create: (companyId: string, data: { name: string; fiscalYear: number; lines?: any[] }) =>
    apiClient.post<Budget>('/reporting/budgets', data, { params: { companyId } }),

  update: (companyId: string, id: string, data: { name?: string; status?: string; fiscalYear?: number }) =>
    apiClient.patch<Budget>(`/reporting/budgets/${id}`, data, { params: { companyId } }),

  delete: (companyId: string, id: string) =>
    apiClient.delete(`/reporting/budgets/${id}`, { params: { companyId } }),

  copy: (companyId: string, id: string, fiscalYear: number) =>
    apiClient.post<Budget>(`/reporting/budgets/${id}/copy`, { fiscalYear }, { params: { companyId } }),
}
