import apiClient from '@/lib/api-client'

export const payrollService = {
  getSummary: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/payroll/summary`, { params }),
  listRuns: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/payroll/runs`, { params }),
  listPaychecks: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/payroll/paychecks`, { params }),
  listSalaryStructures: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/salary-structures`),
  listAllowances: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/allowances`),
  listBenefitPlans: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/benefit-plans`),
}
