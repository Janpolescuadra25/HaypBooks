import apiClient from '@/lib/api-client'

export const timeService = {
  listTimeEntries: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/time/entries`, { params }),

  listTimesheets: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/time/timesheets`, { params }),
}
