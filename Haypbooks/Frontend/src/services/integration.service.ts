import apiClient from '@/lib/api-client'

export const integrationService = {
  // API Keys (3 methods)
  getApiKeys: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/api-keys`),
  createApiKey: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/api-keys`, data),
  deleteApiKey: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/integrations/api-keys/${id}`),

  // Webhooks (5 methods)
  getWebhooks: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/webhooks`),
  createWebhook: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/webhooks`, data),
  updateWebhook: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/integrations/webhooks/${id}`, data),
  deleteWebhook: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/integrations/webhooks/${id}`),
  testWebhook: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/integrations/webhooks/${id}/test`),

  // Installed Apps (4 methods)
  getInstalledApps: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/installed-apps`),
  installApp: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/installed-apps`, data),
  uninstallApp: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/integrations/installed-apps/${id}`),
  configureApp: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/integrations/installed-apps/${id}`, data),

  // Integration Logs (1 method)
  getIntegrationLogs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/logs`),

  // Export Data (4 methods)
  getExportJobs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/exports`),
  createExportJob: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/exports`, data),
  downloadExport: (companyId: string, id: string) =>
    apiClient.get(`/companies/${companyId}/integrations/exports/${id}/download`),
  deleteExportJob: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/integrations/exports/${id}`),

  // Import Data (4 methods)
  getImportJobs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/imports`),
  createImportJob: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/imports`, data),
  getImportJobStatus: (companyId: string, id: string) =>
    apiClient.get(`/companies/${companyId}/integrations/imports/${id}`),
  deleteImportJob: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/integrations/imports/${id}`),

  // Marketplace (1 method)
  getMarketplaceApps: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/integrations/marketplace`),

  // Developer Sandbox (1 method)
  sendSandboxRequest: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/integrations/sandbox/request`, data),
}
