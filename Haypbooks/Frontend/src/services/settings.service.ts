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
}
