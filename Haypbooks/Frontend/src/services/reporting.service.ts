import apiClient from '@/lib/api-client'

type ReportingQueryParams = Record<string, string | number | boolean | undefined>
type ReportingBody = Record<string, unknown>

const buildQuery = (params?: ReportingQueryParams) => {
  const search = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        search.append(key, String(value))
      }
    })
  }
  return search.toString()
}

export const reportingService = {
  // Category Report Pages
  getBankingReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/banking-report', { params: { companyId, ...params } }),

  getExpenseReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/expense-report', { params: { companyId, ...params } }),

  getInventoryReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/inventory-report', { params: { companyId, ...params } }),

  getPayrollReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/payroll-report', { params: { companyId, ...params } }),

  getProjectReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/project-report', { params: { companyId, ...params } }),

  getSalesReport: (companyId: string, params?: ReportingQueryParams) =>
    apiClient.get('/reporting/sales-report', { params: { companyId, ...params } }),

  // CSV Export
  exportBankingReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/banking-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  exportExpenseReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/expense-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  exportInventoryReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/inventory-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  exportPayrollReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/payroll-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  exportProjectReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/project-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  exportSalesReport: (companyId: string, params?: ReportingQueryParams) =>
    fetch(`/api/reporting/sales-report/export?${buildQuery({ ...params, companyId })}`, {
      credentials: 'include',
    }),

  // Custom Reports CRUD
  getCustomReports: (companyId: string) =>
    apiClient.get('/reporting/custom-reports', { params: { companyId } }),

  createCustomReport: (companyId: string, data: ReportingBody) =>
    apiClient.post('/reporting/custom-reports', data, { params: { companyId } }),

  updateCustomReport: (companyId: string, id: string, data: ReportingBody) =>
    apiClient.put(`/reporting/custom-reports/${id}`, data, { params: { companyId } }),

  deleteCustomReport: (companyId: string, id: string) =>
    apiClient.delete(`/reporting/custom-reports/${id}`, { params: { companyId } }),

  // Scheduled Reports CRUD
  getScheduledReports: (companyId: string) =>
    apiClient.get('/reporting/scheduled-reports', { params: { companyId } }),

  createScheduledReport: (companyId: string, data: ReportingBody) =>
    apiClient.post('/reporting/scheduled-reports', data, { params: { companyId } }),

  updateScheduledReport: (companyId: string, id: string, data: ReportingBody) =>
    apiClient.put(`/reporting/scheduled-reports/${id}`, data, { params: { companyId } }),

  deleteScheduledReport: (companyId: string, id: string) =>
    apiClient.delete(`/reporting/scheduled-reports/${id}`, { params: { companyId } }),
}
