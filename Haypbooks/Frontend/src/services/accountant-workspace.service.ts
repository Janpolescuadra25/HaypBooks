import apiClient from '@/lib/api-client'

export const accountantWorkspaceService = {
  // --- Client Requests (4 methods) ---
  getClientRequests: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/accountant-workspace/client-requests`),
  createClientRequest: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/accountant-workspace/client-requests`, data),
  updateClientRequest: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/accountant-workspace/client-requests/${id}`, data),
  deleteClientRequest: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/accountant-workspace/client-requests/${id}`),
}
