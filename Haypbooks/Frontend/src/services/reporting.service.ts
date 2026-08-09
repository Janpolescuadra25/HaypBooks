import apiClient from '@/lib/api-client'

const buildQuery = (params: any) => {
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
  getBankingReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/banking-report`, { params }),

  getExpenseReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/expense-report`, { params }),

  getInventoryReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/inventory-report`, { params }),

  getPayrollReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/payroll-report`, { params }),

  getProjectReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/project-report`, { params }),

  getSalesReport: (companyId: string, params: any) =>
    apiClient.get(`/companies/${companyId}/reporting/sales-report`, { params }),

  // CSV Export
  exportBankingReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/banking-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  exportExpenseReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/expense-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  exportInventoryReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/inventory-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  exportPayrollReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/payroll-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  exportProjectReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/project-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  exportSalesReport: (companyId: string, params: any) =>
    fetch(`/api/companies/${companyId}/reporting/sales-report/export?${buildQuery(params)}`, {
      credentials: 'include',
    }),

  // Custom Reports CRUD
  getCustomReports: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/reporting/custom-reports`),

  createCustomReport: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/reporting/custom-reports`, data),

  updateCustomReport: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/reporting/custom-reports/${id}`, data),

  deleteCustomReport: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/reporting/custom-reports/${id}`),

  // Scheduled Reports CRUD
  getScheduledReports: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/reporting/scheduled-reports`),

  createScheduledReport: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/reporting/scheduled-reports`, data),

  updateScheduledReport: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/reporting/scheduled-reports/${id}`, data),

  deleteScheduledReport: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/reporting/scheduled-reports/${id}`),
}
