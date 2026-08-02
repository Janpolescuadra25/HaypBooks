'use client'

import apiClient from '@/lib/api-client'

export const organizationService = {
  listLegalEntities: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/organization/legal-entities`),

  listConsolidationGroups: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/organization/consolidation`),

  listIntercompanyTransactions: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/organization/intercompany`, { params }),

  listLocations: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/organization/locations`),

  listDepartments: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/organization/departments`),
}
