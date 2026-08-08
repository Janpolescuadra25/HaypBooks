import apiClient from '@/lib/api-client'

export const complianceService = {
  // --- Internal Controls (4 methods) ---
  getInternalControls: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/compliance/internal-controls`),
  createInternalControl: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/compliance/internal-controls`, data),
  updateInternalControl: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/compliance/internal-controls/${id}`, data),
  deleteInternalControl: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/compliance/internal-controls/${id}`),

  // --- Control Testing (4 methods) ---
  getControlTests: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/compliance/control-tests`),
  createControlTest: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/compliance/control-tests`, data),
  updateControlTest: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/compliance/control-tests/${id}`, data),
  deleteControlTest: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/compliance/control-tests/${id}`),

  // --- Policy Management (4 methods) ---
  getPolicies: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/compliance/policies`),
  createPolicy: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/compliance/policies`, data),
  updatePolicy: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/compliance/policies/${id}`, data),
  deletePolicy: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/compliance/policies/${id}`),
}
