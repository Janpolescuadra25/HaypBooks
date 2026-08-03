import apiClient from '@/lib/api-client'

export const timeService = {
  listTimeEntries: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/time/entries`, { params }),

  listTimesheets: (companyId: string, params?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/time/timesheets`, { params }),

  getTimerSessions: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/time/timer/sessions`),

  startTimer: (companyId: string, body?: Record<string, any>) =>
    apiClient.post(`/companies/${companyId}/time/timer/start`, body),

  stopTimer: (companyId: string) =>
    apiClient.post(`/companies/${companyId}/time/timer/stop`),

  approveTimesheet: (companyId: string, timesheetId: string) =>
    apiClient.post(`/companies/${companyId}/time/timesheets/${timesheetId}/approve`),

  rejectTimesheet: (companyId: string, timesheetId: string, body?: Record<string, any>) =>
    apiClient.post(`/companies/${companyId}/time/timesheets/${timesheetId}/reject`, body),
}
