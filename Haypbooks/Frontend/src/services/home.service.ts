import apiClient from '@/lib/api-client'

export const homeService = {
  getNotifications: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/home/notifications`),
  markAsRead: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/home/notifications/${id}/read`),
  markAllAsRead: (companyId: string) =>
    apiClient.post(`/companies/${companyId}/home/notifications/read-all`),
  getBusinessHealth: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/home/business-health`),
  getPerformance: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/home/performance`),
}
