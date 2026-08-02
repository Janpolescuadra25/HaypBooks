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
  listDeductions: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/deductions`),
  listLoans: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/loans`),
  listGovernmentContributions: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/payroll/government-contributions`, { params }),
  listLeaveBalances: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/leave-balances`),
  listShiftSchedules: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payroll/shift-schedules`),
  listLeaveRequests: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/payroll/leave-requests`, { params }),
  approveLeaveRequest: (companyId: string, requestId: string) =>
    apiClient.patch(`/companies/${companyId}/payroll/leave-requests/${requestId}/approve`),
  rejectLeaveRequest: (companyId: string, requestId: string) =>
    apiClient.patch(`/companies/${companyId}/payroll/leave-requests/${requestId}/reject`),
}
