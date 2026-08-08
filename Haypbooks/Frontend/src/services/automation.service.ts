import apiClient from '@/lib/api-client'

export const automationService = {
  // --- Workflows (4 methods) ---
  getWorkflows: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/workflows`),
  createWorkflow: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/automation/workflows`, data),
  updateWorkflow: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/automation/workflows/${id}`, data),
  deleteWorkflow: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/automation/workflows/${id}`),

  // --- Smart Rules (4 methods) ---
  getSmartRules: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/smart-rules`),
  createSmartRule: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/automation/smart-rules`, data),
  updateSmartRule: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/automation/smart-rules/${id}`, data),
  deleteSmartRule: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/automation/smart-rules/${id}`),

  // --- AI Bookkeeping (4 methods) ---
  getAISuggestions: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/ai-suggestions`),
  approveSuggestion: (companyId: string, id: string) =>
    apiClient.put(`/companies/${companyId}/automation/ai-suggestions/${id}/approve`),
  rejectSuggestion: (companyId: string, id: string) =>
    apiClient.put(`/companies/${companyId}/automation/ai-suggestions/${id}/reject`),
  batchApproveSuggestions: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/automation/ai-suggestions/batch-approve`, { ids }),

  // --- Smart Matching (4 methods) ---
  getSmartMatchingRules: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/smart-matching`),
  createSmartMatchingRule: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/automation/smart-matching`, data),
  updateSmartMatchingRule: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/automation/smart-matching/${id}`, data),
  deleteSmartMatchingRule: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/automation/smart-matching/${id}`),

  // --- Automation Logs (2 methods) ---
  getAutomationLogs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/logs`),
  getAutomationLogDetails: (companyId: string, id: string) =>
    apiClient.get(`/companies/${companyId}/automation/logs/${id}`),

  // --- Error Queue (2 methods) ---
  getErrorQueue: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/automation/error-queue`),
  resolveError: (companyId: string, id: string, data: any) =>
    apiClient.post(`/companies/${companyId}/automation/error-queue/${id}/resolve`, data),
}
