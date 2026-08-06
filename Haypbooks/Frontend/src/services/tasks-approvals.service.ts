import apiClient from '@/lib/api-client'

export const tasksApprovalsService = {
  listApprovals: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/tasks-approvals`, { params }),

  getApproval: (companyId: string, approvalId: string) =>
    apiClient.get(`/companies/${companyId}/tasks-approvals/${approvalId}`),

  approveRequest: (companyId: string, approvalId: string) =>
    apiClient.post(`/companies/${companyId}/tasks-approvals/${approvalId}/approve`),

  rejectRequest: (companyId: string, approvalId: string, body: Record<string, any>) =>
    apiClient.post(`/companies/${companyId}/tasks-approvals/${approvalId}/reject`, body),

  listTasks: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/tasks`, { params }),

  getTask: (companyId: string, taskId: string) =>
    apiClient.get(`/companies/${companyId}/tasks/${taskId}`),

  updateTask: (companyId: string, taskId: string, body: Record<string, any>) =>
    apiClient.put(`/companies/${companyId}/tasks/${taskId}`, body),

  listTaskTemplates: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/tasks/templates`, { params }),
}
