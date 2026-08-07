import apiClient from '@/lib/api-client'

export const settingsService = {
  // Company Details
  getCompanyDetails: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/company-details`),

  updateCompanyDetails: (companyId: string, data: any) =>
    apiClient.put(`/companies/${companyId}/settings/company-details`, data),

  // Fiscal Year
  getFiscalYearSetup: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/fiscal-year`),

  updateFiscalYearSetup: (companyId: string, data: any) =>
    apiClient.put(`/companies/${companyId}/settings/fiscal-year`, data),

  // Numbering Sequences
  getNumberingSequences: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/numbering-sequences`),

  updateNumberingSequence: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/settings/numbering-sequences/${id}`, data),

  // Custom Fields
  getCustomFields: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/custom-fields`),

  createCustomField: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/settings/custom-fields`, data),

  updateCustomField: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/settings/custom-fields/${id}`, data),

  deleteCustomField: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/settings/custom-fields/${id}`),

  // Data Backup
  getBackupHistory: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/backups`),

  createBackup: (companyId: string) =>
    apiClient.post(`/companies/${companyId}/settings/backups`),

  // User Management
  getCompanyUsers: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/users`),

  createCompanyUser: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/users`, data),

  updateCompanyUser: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/users/${id}`, data),

  deleteCompanyUser: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/users/${id}`),

  // Roles & Permissions
  getRoles: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/roles`),

  createRole: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/roles`, data),

  updateRole: (companyId: string, id: string, data: any) =>
    apiClient.put(`/companies/${companyId}/roles/${id}`, data),

  deleteRole: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/roles/${id}`),

  // Two-Factor Authentication
  getTwoFactorConfig: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/settings/two-factor`),

  updateTwoFactorConfig: (companyId: string, data: any) =>
    apiClient.put(`/companies/${companyId}/settings/two-factor`, data),
}
