'use client'

import apiClient from '@/lib/api-client'

export const projectsService = {
  listProjects: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/projects`, { params }),

  listChangeOrders: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/change-orders`),

  listWip: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/projects/wip`),

  listResourcePlans: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/projects/resource-plans`),

  listMilestones: (companyId: string, projectId: string) =>
    apiClient.get(`/companies/${companyId}/projects/${projectId}/milestones`),

  listProjectTasks: (companyId: string, projectId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/projects/${projectId}/tasks`, { params }),

  listProjectBilling: (companyId: string, projectId: string) =>
    apiClient.get(`/companies/${companyId}/projects/${projectId}/billing`),

  listProjectTimeEntries: (companyId: string, projectId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/projects/${projectId}/time-entries`, { params }),

  listProjectExpenses: (companyId: string, projectId: string) =>
    apiClient.get(`/companies/${companyId}/projects/${projectId}/expenses`),
}
