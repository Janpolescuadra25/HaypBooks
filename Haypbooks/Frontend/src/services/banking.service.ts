// ─── Frontend API Service: Banking ──────────────────────────────────────

import apiClient from '@/lib/api-client'

export const bankingService = {
  // ─── Cash Position ────────────────────────────────────────────────────
  getCashPosition: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/cash-position`),

  // ─── Bank Accounts ────────────────────────────────────────────────────
  listBankAccounts: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/accounts`),

  getBankAccount: (companyId: string, accountId: string) =>
    apiClient.get(`/companies/${companyId}/banking/accounts/${accountId}`),

  createBankAccount: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/accounts`, body),

  updateBankAccount: (companyId: string, accountId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/banking/accounts/${accountId}`, body),

  deleteBankAccount: (companyId: string, accountId: string) =>
    apiClient.delete(`/companies/${companyId}/banking/accounts/${accountId}`),

  // ─── Transactions ─────────────────────────────────────────────────────
  listTransactions: (companyId: string, bankAccountId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/banking/accounts/${bankAccountId}/transactions`, { params: query }),

  createTransaction: (companyId: string, bankAccountId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/accounts/${bankAccountId}/transactions`, body),

  updateTransaction: (companyId: string, bankAccountId: string, txnId: string, body: any) =>
    apiClient.patch(`/companies/${companyId}/banking/accounts/${bankAccountId}/transactions/${txnId}`, body),

  importTransactions: (companyId: string, bankAccountId: string, body: any[]) =>
    apiClient.post(`/companies/${companyId}/banking/accounts/${bankAccountId}/transactions/import`, body),

  // ─── Transfers ────────────────────────────────────────────────────────
  createTransfer: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/transfers`, body),

  // ─── Reconciliation ───────────────────────────────────────────────────
  listReconciliations: (companyId: string, bankAccountId: string) =>
    apiClient.get(`/companies/${companyId}/banking/accounts/${bankAccountId}/reconciliations`),

  createReconciliation: (companyId: string, bankAccountId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/accounts/${bankAccountId}/reconciliations`, body),

  getReconciliation: (companyId: string, reconId: string) =>
    apiClient.get(`/companies/${companyId}/banking/reconciliations/${reconId}`),

  matchTransaction: (companyId: string, reconId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/reconciliations/${reconId}/match`, body),

  unmatchTransaction: (companyId: string, reconId: string, bankTxnId: string) =>
    apiClient.delete(`/companies/${companyId}/banking/reconciliations/${reconId}/match/${bankTxnId}`),

  autoMatch: (companyId: string, reconId: string) =>
    apiClient.post(`/companies/${companyId}/banking/reconciliations/${reconId}/auto-match`),

  completeReconciliation: (companyId: string, reconId: string) =>
    apiClient.post(`/companies/${companyId}/banking/reconciliations/${reconId}/complete`),

  undoReconciliation: (companyId: string, reconId: string) =>
    apiClient.post(`/companies/${companyId}/banking/reconciliations/${reconId}/undo`),

  // ─── Deposits ─────────────────────────────────────────────────────────
  listDeposits: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/banking/deposits`, { params: query }),

  createDeposit: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/deposits`, body),

  postDeposit: (companyId: string, depositId: string) =>
    apiClient.post(`/companies/${companyId}/banking/deposits/${depositId}/post`),

  voidDeposit: (companyId: string, depositId: string) =>
    apiClient.post(`/companies/${companyId}/banking/deposits/${depositId}/void`),

  // ─── Undeposited Funds ────────────────────────────────────────────────
  listUndepositedFunds: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/undeposited-funds`),

  // ─── Feed Connections ─────────────────────────────────────────────────
  listFeedConnections: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/feed-connections`),

  createFeedConnection: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/feed-connections`, body),

  updateFeedConnection: (companyId: string, id: string, body: any) =>
    apiClient.put(`/companies/${companyId}/banking/feed-connections/${id}`, body),

  deleteFeedConnection: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/banking/feed-connections/${id}`),

  syncFeedConnection: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/banking/feed-connections/${id}/sync`),

  getFeedStatus: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/feed-status`),

  // ─── Credit Cards ─────────────────────────────────────────────────────
  listCreditCards: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/credit-cards`),

  listCardStatements: (companyId: string, cardId: string) =>
    apiClient.get(`/companies/${companyId}/banking/credit-cards/${cardId}/statements`),

  // ─── Checks ───────────────────────────────────────────────────────────
  listChecks: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/banking/checks`, { params: query }),

  createCheck: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/checks`, body),

  updateCheck: (companyId: string, checkId: string, body: any) =>
    apiClient.patch(`/companies/${companyId}/banking/checks/${checkId}`, body),

  // ─── Smart Rules ──────────────────────────────────────────────────────
  listSmartRules: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/banking/smart-rules`),

  createSmartRule: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/banking/smart-rules`, body),

  updateSmartRule: (companyId: string, id: string, body: any) =>
    apiClient.put(`/companies/${companyId}/banking/smart-rules/${id}`, body),

  deleteSmartRule: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/banking/smart-rules/${id}`),
}
