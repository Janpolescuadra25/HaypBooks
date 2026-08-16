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

export interface BudgetLineAccount {
  id: string
  code: string
  name: string
}

export interface BudgetLine {
  id: string
  budgetId: string
  workspaceId: string
  accountId: string | null
  classId: string | null
  month: number | null
  amount: string
  createdAt: string
  account: BudgetLineAccount | null
}

export interface BudgetDetail extends Budget {
  lines: BudgetLine[]
}

export interface BudgetVsActualRow {
  accountId: string | null
  accountCode: string | null
  accountName: string | null
  month: number | null
  budgeted: number
  actual: number
  variance: number
  variancePct: number
}

export interface BudgetVsActualResponse {
  budget: { id: string; name: string; fiscalYear: number; currency?: string }
  rows: BudgetVsActualRow[]
  from: string
  to: string
  currency?: string
}

export const budgetService = {
  list: (companyId: string) =>
    apiClient.get<Budget[]>('/reporting/budgets', { params: { companyId } }),

  getById: (companyId: string, id: string) =>
    apiClient.get<BudgetDetail>(`/reporting/budgets/${id}`, { params: { companyId } }),

  create: (companyId: string, data: { name: string; fiscalYear: number; lines?: any[] }) =>
    apiClient.post<Budget>('/reporting/budgets', data, { params: { companyId } }),

  update: (companyId: string, id: string, data: { name?: string; status?: string; fiscalYear?: number }) =>
    apiClient.patch<Budget>(`/reporting/budgets/${id}`, data, { params: { companyId } }),

  delete: (companyId: string, id: string) =>
    apiClient.delete(`/reporting/budgets/${id}`, { params: { companyId } }),

  copy: (companyId: string, id: string, fiscalYear: number) =>
    apiClient.post<Budget>(`/reporting/budgets/${id}/copy`, { fiscalYear }, { params: { companyId } }),

  addLine: (companyId: string, budgetId: string, data: { accountId: string; month: number | null; amount: number }) =>
    apiClient.post(`/reporting/budgets/${budgetId}/lines`, data, { params: { companyId } }),

  updateLine: (companyId: string, budgetId: string, lineId: string, data: { accountId?: string; month?: number | null; amount?: number }) =>
    apiClient.patch(`/reporting/budgets/${budgetId}/lines/${lineId}`, data, { params: { companyId } }),

  deleteLine: (companyId: string, budgetId: string, lineId: string) =>
    apiClient.delete(`/reporting/budgets/${budgetId}/lines/${lineId}`, { params: { companyId } }),

  getBudgetVsActual: (companyId: string, budgetId: string, opts?: { from?: string; to?: string }) =>
    apiClient.get<BudgetVsActualResponse>(`/reporting/budgets/${budgetId}/vs-actual`, { params: { companyId, ...opts } }),
}
