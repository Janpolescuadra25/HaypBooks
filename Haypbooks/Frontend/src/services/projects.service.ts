'use client'

import apiClient from '@/lib/api-client'

export const projectsService = {
  listProjects: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/projects`, { params }),

  listChangeOrders: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/change-orders`),
}
