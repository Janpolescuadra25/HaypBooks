// ─── Frontend API Service: Sales ────────────────────────────────────────

import apiClient from '@/lib/api-client'

export type CustomerStatus = 'ACTIVE' | 'INACTIVE'

export interface CustomerGroup {
  id: string
  name: string
}

export interface PaymentTerm {
  id: string
  name: string
  dueDays: number
  discountDays?: number | null
  discountPct?: number | null
  isDefault?: boolean
}

export interface ArCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  paymentTermId?: string | null
  paymentTermName?: string | null
  creditLimit?: number | null
  openBalance?: number
  totalRevenue?: number
  invoiceCount?: number
  status?: CustomerStatus
  groupId?: string | null
  groupName?: string | null
}

export interface ArCustomerQuery {
  search?: string
  status?: CustomerStatus
  groupId?: string
}

export interface DunningStep {
  id: string
  profileId: string
  dayOffset: number
  channel: string
  templateKey: string
  isActive: boolean
}

export interface DunningProfile {
  id: string
  workspaceId: string
  companyId: string
  name: string
  isActive: boolean
  createdAt: string
  steps: DunningStep[]
}

export const salesService = {
  // ─── Customers ────────────────────────────────────────────────────────
  listCustomers: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/customers`, { params: query }),

  getCustomer: (companyId: string, customerId: string) =>
    apiClient.get(`/companies/${companyId}/customers/${customerId}`),

  createCustomer: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/customers`, body),

  updateCustomer: (companyId: string, customerId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/customers/${customerId}`, body),

  deleteCustomer: (companyId: string, customerId: string) =>
    apiClient.delete(`/companies/${companyId}/customers/${customerId}`),

  // ─── AR Customers ─────────────────────────────────────────────────────
  listArCustomers: (companyId: string, query?: ArCustomerQuery) =>
    apiClient.get<ArCustomer[]>(`/companies/${companyId}/ar/customers`, {
      params: {
        search: query?.search || undefined,
        status: query?.status || undefined,
        groupId: query?.groupId || undefined,
      },
    }),

  getArCustomer: (companyId: string, customerId: string) =>
    apiClient.get<ArCustomer>(`/companies/${companyId}/ar/customers/${customerId}`),

  createArCustomer: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/customers`, body),

  updateArCustomer: (companyId: string, customerId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/customers/${customerId}`, body),

  deleteArCustomer: (companyId: string, customerId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/customers/${customerId}`),

  batchDeleteArCustomers: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/customers/batch/delete`, { ids }),

  updateArCustomersStatus: (companyId: string, ids: string[], status: CustomerStatus) =>
    apiClient.patch(`/companies/${companyId}/ar/customers/batch/status`, { ids, status }),

  exportArCustomers: (companyId: string, query?: ArCustomerQuery) =>
    apiClient.get<string>(`/companies/${companyId}/ar/customers/export`, {
      params: {
        search: query?.search || undefined,
        status: query?.status || undefined,
        groupId: query?.groupId || undefined,
      },
    }),

  getArAgingReport: (companyId: string, query?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/ar/reports/aging`, { params: query }),

  getArCustomerActivity: (companyId: string, customerId?: string, params?: Record<string, any>) =>
    apiClient.get(
      customerId
        ? `/companies/${companyId}/ar/customers/${customerId}/activity`
        : `/companies/${companyId}/ar/customers/activity`,
      { params },
    ),

  // TODO: move to domain-specific service (accounting)
  getChartOfAccounts: (companyId: string, query?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/chart-of-accounts`, { params: query }),

  // TODO: move to domain-specific service (audit)
  getAuditLogs: (companyId: string, query?: Record<string, any>) =>
    apiClient.get(`/companies/${companyId}/integrations/audit-logs`, { params: query }),

  // ─── QUOTES ───────────────────────────────────────────────────────────
  getQuotes: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/quotes`, { params: query }),

  getQuoteById: (companyId: string, quoteId: string) =>
    apiClient.get(`/companies/${companyId}/ar/quotes/${quoteId}`),

  getQuoteActivity: (companyId: string, quoteId: string) =>
    apiClient.get(`/companies/${companyId}/ar/quotes/${quoteId}/activity`),

  createQuote: (companyId: string, data: any) =>
    apiClient.post(`/companies/${companyId}/ar/quotes`, data),

  updateQuote: (companyId: string, quoteId: string, data: any) =>
    apiClient.put(`/companies/${companyId}/ar/quotes/${quoteId}`, data),

  deleteQuote: (companyId: string, quoteId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/quotes/${quoteId}`),

  updateQuoteStatus: (companyId: string, quoteId: string, status: string) =>
    apiClient.patch(`/companies/${companyId}/ar/quotes/${quoteId}/status`, { status }),

  convertQuote: (companyId: string, quoteId: string) =>
    apiClient.post(`/companies/${companyId}/ar/quotes/${quoteId}/convert`),

  batchDeleteQuotes: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/quotes/batch/delete`, { ids }),

  batchUpdateQuoteStatus: (companyId: string, ids: string[], status: string) =>
    apiClient.patch(`/companies/${companyId}/ar/quotes/batch/status`, { ids, status }),

  exportQuotes: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/quotes/export`, { params: query }),

  listArPaymentTerms: (companyId: string) =>
    apiClient.get<PaymentTerm[]>(`/companies/${companyId}/ar/payment-terms`),

  createArPaymentTerm: (companyId: string, body: { name: string; dueDays: number; discountDays?: number | null; discountPct?: number | null; isDefault?: boolean }) =>
    apiClient.post(`/companies/${companyId}/ar/payment-terms`, body),

  updateArPaymentTerm: (companyId: string, id: string, body: Partial<{ name: string; dueDays: number; discountDays: number | null; discountPct: number | null; isDefault: boolean; isActive: boolean }>) =>
    apiClient.put(`/companies/${companyId}/ar/payment-terms/${id}`, body),

  deleteArPaymentTerm: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/ar/payment-terms/${id}`),

  listArCustomerGroups: (companyId: string) =>
    apiClient.get<CustomerGroup[]>(`/companies/${companyId}/ar/customer-groups`),

  // ─── AR Invoices ───────────────────────────────────────────────────────
  listArInvoices: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/invoices`, { params: query }),

  sendArDunningNotice: (companyId: string, invoiceId: string, level: number) =>
    apiClient.post(`/companies/${companyId}/ar/dunning/send`, { invoiceId, level }),

  updateArDunningLevel: (companyId: string, invoiceId: string, level: number) =>
    apiClient.patch(`/companies/${companyId}/ar/dunning/${invoiceId}/level`, { level }),

  sendArDunningBatch: (companyId: string, invoiceIds: string[], level: number) =>
    apiClient.post(`/companies/${companyId}/ar/dunning/batch/send`, { invoiceIds, level }),

  getArDunningActivity: (companyId: string, invoiceId: string) =>
    apiClient.get(`/companies/${companyId}/ar/dunning/${invoiceId}/activity`),

  // Dunning Profile CRUD
  getDunningProfiles: (companyId: string) =>
    apiClient.get<DunningProfile[]>(`/companies/${companyId}/ar/dunning-profiles`),

  createDunningProfile: (companyId: string, body: { name: string; isActive?: boolean }) =>
    apiClient.post<DunningProfile>(`/companies/${companyId}/ar/dunning-profiles`, body),

  updateDunningProfile: (companyId: string, profileId: string, body: { name?: string; isActive?: boolean }) =>
    apiClient.put<DunningProfile>(`/companies/${companyId}/ar/dunning-profiles/${profileId}`, body),

  deleteDunningProfile: (companyId: string, profileId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/dunning-profiles/${profileId}`),

  // Dunning Step CRUD
  getDunningSteps: (companyId: string, profileId: string) =>
    apiClient.get<DunningStep[]>(`/companies/${companyId}/ar/dunning-profiles/${profileId}/steps`),

  createDunningStep: (companyId: string, profileId: string, body: { dayOffset: number; channel: string; templateKey: string; isActive?: boolean }) =>
    apiClient.post<DunningStep>(`/companies/${companyId}/ar/dunning-profiles/${profileId}/steps`, body),

  updateDunningStep: (companyId: string, profileId: string, stepId: string, body: { dayOffset?: number; channel?: string; templateKey?: string; isActive?: boolean }) =>
    apiClient.put<DunningStep>(`/companies/${companyId}/ar/dunning-profiles/${profileId}/steps/${stepId}`, body),

  deleteDunningStep: (companyId: string, profileId: string, stepId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/dunning-profiles/${profileId}/steps/${stepId}`),

  sendArInvoice: (companyId: string, invoiceId: string, body?: any) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/send`, body),

  getArInvoice: (companyId: string, invoiceId: string) =>
    apiClient.get(`/companies/${companyId}/ar/invoices/${invoiceId}`),

  getArInvoiceActivity: (companyId: string, invoiceId: string) =>
    apiClient.get(`/companies/${companyId}/ar/invoices/${invoiceId}/activity`),

  updateArInvoice: (companyId: string, invoiceId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/invoices/${invoiceId}`, body),

  createArInvoice: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/invoices`, body),

  voidArInvoice: (companyId: string, invoiceId: string, reason?: string) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/void`, { reason }),

  duplicateArInvoice: (companyId: string, invoiceId: string) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/duplicate`),

  // ─── AR Payments ──────────────────────────────────────────────────────
  listArPayments: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/payments`, { params: query }),

  createArPayment: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/payments`, body),

  updateArPayment: (companyId: string, paymentId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/payments/${paymentId}`, body),

  voidArPayment: (companyId: string, paymentId: string) =>
    apiClient.post(`/companies/${companyId}/ar/payments/${paymentId}/void`),

  getArPaymentActivity: (companyId: string, paymentId: string) =>
    apiClient.get(`/companies/${companyId}/ar/payments/${paymentId}/activity`),

  recordInvoicePayment: (companyId: string, invoiceId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/payments`, body),

  // ─── Email Templates ──────────────────────────────────────────────────
  getEmailTemplates: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/email-templates`),

  createEmailTemplate: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/email-templates`, body),

  updateEmailTemplate: (companyId: string, templateId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/email-templates/${templateId}`, body),

  deleteEmailTemplate: (companyId: string, templateId: string) =>
    apiClient.delete(`/companies/${companyId}/email-templates/${templateId}`),

  // ─── AR Recurring Invoices ─────────────────────────────────────────────
  listArRecurringInvoices: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/recurring-invoices`),

  createArRecurringInvoice: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/recurring-invoices`, body),

  getArRecurringInvoice: (companyId: string, id: string) =>
    apiClient.get(`/companies/${companyId}/ar/recurring-invoices/${id}`),

  generateRecurringInvoice: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/ar/recurring-invoices/${id}/generate`),

  updateRecurringInvoice: (companyId: string, id: string, body: Record<string, any>) =>
    apiClient.put(`/companies/${companyId}/ar/recurring-invoices/${id}`, body),

  batchDeleteRecurringInvoices: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/recurring-invoices/batch/delete`, { ids }),

  // ─── AR Write-Offs ─────────────────────────────────────────────────────
  listArWriteOffs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/write-offs`),

  getArWriteOff: (companyId: string, writeOffId: string) =>
    apiClient.get(`/companies/${companyId}/ar/write-offs/${writeOffId}`),

  createArWriteOff: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/write-offs`, body),

  updateArWriteOff: (companyId: string, writeOffId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/write-offs/${writeOffId}`, body),

  approveArWriteOff: (companyId: string, writeOffId: string) =>
    apiClient.post(`/companies/${companyId}/ar/write-offs/${writeOffId}/approve`),

  reverseArWriteOff: (companyId: string, writeOffId: string) =>
    apiClient.post(`/companies/${companyId}/ar/write-offs/${writeOffId}/reverse`),

  deleteArWriteOff: (companyId: string, writeOffId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/write-offs/${writeOffId}`),

  batchDeleteArWriteOffs: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/write-offs/batch/delete`, { ids }),

  getArWriteOffActivity: (companyId: string, writeOffId: string) =>
    apiClient.get(`/companies/${companyId}/ar/write-offs/${writeOffId}/activity`),

  // ─── AR Refunds ───────────────────────────────────────────────────────
  listArRefunds: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/refunds`),

  getArRefund: (companyId: string, refundId: string) =>
    apiClient.get(`/companies/${companyId}/ar/refunds/${refundId}`),

  createArRefund: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/refunds`, body),

  updateArRefund: (companyId: string, refundId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/refunds/${refundId}`, body),

  processArRefund: (companyId: string, refundId: string) =>
    apiClient.post(`/companies/${companyId}/ar/refunds/${refundId}/process`),

  batchDeleteArRefunds: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/refunds/batch/delete`, { ids }),

  getArRefundActivity: (companyId: string, refundId: string) =>
    apiClient.get(`/companies/${companyId}/ar/refunds/${refundId}/activity`),

  // ─── AR Sales Orders ─────────────────────────────────────────────────
  listArSalesOrders: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/sales-orders`),

  getArSalesOrder: (companyId: string, orderId: string) =>
    apiClient.get(`/companies/${companyId}/ar/sales-orders/${orderId}`),

  createArSalesOrder: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/sales-orders`, body),

  updateArSalesOrder: (companyId: string, orderId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/sales-orders/${orderId}`, body),

  deleteArSalesOrder: (companyId: string, orderId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/sales-orders/${orderId}`),

  convertArSalesOrder: (companyId: string, orderId: string) =>
    apiClient.post(`/companies/${companyId}/ar/sales-orders/${orderId}/convert`),

  batchDeleteArSalesOrders: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/sales-orders/batch/delete`, { ids }),

  getArSalesOrderActivity: (companyId: string, orderId: string) =>
    apiClient.get(`/companies/${companyId}/ar/sales-orders/${orderId}/activity`),

  // ─── Payment Links ───────────────────────────────────────────────────
  listPaymentLinks: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/payment-links`),

  createPaymentLink: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/payment-links`, body),

  // ── Deferred Revenue ──────────────────────────────
  listDeferredRevenue: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/deferred-revenue`),

  createDeferredRevenue: (companyId: string, payload: { contractId?: string; description: string; totalDeferredAmount: number; startDate: string; endDate: string; frequency: string }) =>
    apiClient.post(`/companies/${companyId}/deferred-revenue`, payload),

  recognizeDeferredRevenue: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/deferred-revenue/${id}/recognize`),

  getDeferredRevenueActivity: (companyId: string, scheduleId: string) =>
    apiClient.get(`/companies/${companyId}/deferred-revenue/${scheduleId}/activity`),

  // ── Revenue Recognition ──────────────────────────
  listRevenueRecognition: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/revenue-recognition`),

  createRevenueRecognition: (companyId: string, payload: { contractId?: string; description: string; totalContractValue: number; startDate: string; endDate: string; method: string }) =>
    apiClient.post(`/companies/${companyId}/revenue-recognition`, payload),

  recognizeRevenueRecognition: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/revenue-recognition/${id}/recognize`),

  getRevenueRecognitionActivity: (companyId: string, contractId: string) =>
    apiClient.get(`/companies/${companyId}/revenue-recognition/${contractId}/activity`),

  // ─── Inventory Items ───────────────────────────────────────────────────
  listInventoryItems: (companyId: string, query?: { limit?: number; type?: string; search?: string }) =>
    apiClient.get(`/companies/${companyId}/inventory/items`, { params: query }),

  getInventoryItem: (companyId: string, itemId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/items/${itemId}`),

  createInventoryItem: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/inventory/items`, body),

  updateInventoryItem: (companyId: string, itemId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/inventory/items/${itemId}`, body),

  deleteInventoryItem: (companyId: string, itemId: string) =>
    apiClient.delete(`/companies/${companyId}/inventory/items/${itemId}`),

  getInventoryItemActivity: (companyId: string, itemId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/items/${itemId}/activity`),

  // ─── Credit Notes ──────────────────────────────────────────────────────
  listCreditNotes: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/credit-notes`, { params: query }),

  createCreditNote: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/credit-notes`, body),

  updateCreditNote: (companyId: string, creditNoteId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/credit-notes/${creditNoteId}`, body),

  voidCreditNote: (companyId: string, creditNoteId: string) =>
    apiClient.post(`/companies/${companyId}/ar/credit-notes/${creditNoteId}/void`),

  applyCreditNote: (companyId: string, creditNoteId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/credit-notes/${creditNoteId}/apply`, body),

  batchDeleteCreditNotes: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/credit-notes/batch/delete`, { ids }),

  exportCreditNotes: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/credit-notes/export`, { params: query }),

  getCreditNoteActivity: (companyId: string, creditNoteId: string) =>
    apiClient.get(`/companies/${companyId}/ar/credit-notes/${creditNoteId}/activity`),

  listArCollections: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/collections`, { params: query }),

  batchDeleteArCollections: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/collections/batch/delete`, { ids }),

  batchUpdateArCollectionsStatus: (companyId: string, ids: string[], status: string) =>
    apiClient.patch(`/companies/${companyId}/ar/collections/batch/status`, { ids, status }),

  exportArCollections: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/collections/export`, { params: query }),

  deleteArCollection: (companyId: string, collectionId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/collections/${collectionId}`),

  createArCollection: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ar/collections`, body),

  updateArCollection: (companyId: string, collectionId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ar/collections/${collectionId}`, body),

  getArCustomerGroup: (companyId: string, groupId: string) =>
    apiClient.get(`/companies/${companyId}/ar/customer-groups/${groupId}`),

  createArCustomerGroup: (companyId: string, data: Record<string, any>) =>
    apiClient.post(`/companies/${companyId}/ar/customer-groups`, data),

  updateArCustomerGroup: (companyId: string, groupId: string, data: Record<string, any>) =>
    apiClient.put(`/companies/${companyId}/ar/customer-groups/${groupId}`, data),

  deleteArCustomerGroup: (companyId: string, groupId: string) =>
    apiClient.delete(`/companies/${companyId}/ar/customer-groups/${groupId}`),

  batchDeleteArCustomerGroups: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/customer-groups/batch/delete`, { ids }),

  exportArCustomerGroups: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/customer-groups/export`),

  getArCustomerGroupMembers: (companyId: string, groupId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, { params: query }),

  addArCustomerGroupMembers: (companyId: string, groupId: string, customerIds: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, { customerIds }),

  removeArCustomerGroupMembers: (companyId: string, groupId: string, customerIds: string[]) =>
    apiClient.delete(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, { data: { customerIds } }),

  getArCustomerGroupActivity: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/integrations/audit-logs`, { params: query }),
}

export const arService = {
  // ─── Accounts Receivable ──────────────────────────────────────────────
  listArAging: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/reports/aging`, { params: query }),
}
