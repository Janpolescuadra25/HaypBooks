// ─── Frontend API Service: Accounting ───
// Wraps all accounting-related API calls with proper typing

import apiClient from '@/lib/api-client'

export const accountingService = {
  // ─── Account Types ────────────────────────────────────────────────────
  listAccountTypes: () => apiClient.get('/companies/default/accounting/account-types'),

  // ─── Chart of Accounts ────────────────────────────────────────────────
  listAccounts: (companyId: string, opts?: { includeInactive?: boolean }) =>
    apiClient.get(`/companies/${companyId}/accounting/accounts`, { params: opts }),

  getAccount: (companyId: string, accountId: string) =>
    apiClient.get(`/companies/${companyId}/accounting/accounts/${accountId}`),

  createAccount: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/accounting/accounts`, body),

  updateAccount: (companyId: string, accountId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/accounting/accounts/${accountId}`, body),

  deleteAccount: (companyId: string, accountId: string) =>
    apiClient.delete(`/companies/${companyId}/accounting/accounts/${accountId}`),

  seedDefaultAccounts: (companyId: string) =>
    apiClient.post(`/companies/${companyId}/accounting/accounts/seed-default`),

  listCoaTemplates: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/accounting/coa-templates`),

  getAccountLedger: (companyId: string, accountId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/accounting/accounts/${accountId}/ledger`, { params: query }),

  // ─── Journal Entries ──────────────────────────────────────────────────
  listJournalEntries: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/accounting/journal-entries`, { params: query }),

  getJournalEntry: (companyId: string, jeId: string) =>
    apiClient.get(`/companies/${companyId}/accounting/journal-entries/${jeId}`),

  createJournalEntry: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/accounting/journal-entries`, body),

  updateJournalEntry: (companyId: string, jeId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/accounting/journal-entries/${jeId}`, body),

  postJournalEntry: (companyId: string, jeId: string) =>
    apiClient.post(`/companies/${companyId}/accounting/journal-entries/${jeId}/post`),

  voidJournalEntry: (companyId: string, jeId: string, reason?: string) =>
    apiClient.post(`/companies/${companyId}/accounting/journal-entries/${jeId}/void`, { reason }),

  // ─── Trial Balance ────────────────────────────────────────────────────
  getTrialBalance: (companyId: string, asOf?: string) =>
    apiClient.get(`/companies/${companyId}/accounting/trial-balance`, { params: { asOf } }),

  // ─── Accounting Periods ───────────────────────────────────────────────
  listPeriods: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/accounting/periods`),

  createPeriod: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/accounting/periods`, body),

  closePeriod: (companyId: string, periodId: string) =>
    apiClient.post(`/companies/${companyId}/accounting/periods/${periodId}/close`),

  reopenPeriod: (companyId: string, periodId: string) =>
    apiClient.post(`/companies/${companyId}/accounting/periods/${periodId}/reopen`),

  // ─── Multi-Currency ───────────────────────────────────────────────────
  getMultiCurrencyRevaluation: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/accounting/period-close/multi-currency-revaluation`, { params: query }),
}
