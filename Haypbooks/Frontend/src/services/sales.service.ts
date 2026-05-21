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

  getArCustomerActivity: (companyId: string, customerId: string) =>
    apiClient.get<{ data: any[] }>(`/companies/${companyId}/ar/customers/${customerId}/activity`),

  listArPaymentTerms: (companyId: string) =>
    apiClient.get<PaymentTerm[]>(`/companies/${companyId}/ar/payment-terms`),

  listArCustomerGroups: (companyId: string) =>
    apiClient.get<CustomerGroup[]>(`/companies/${companyId}/ar/customer-groups`),

  // ─── Invoices ─────────────────────────────────────────────────────────
  listInvoices: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/invoices`, { params: query }),

  getInvoice: (companyId: string, invoiceId: string) =>
    apiClient.get(`/companies/${companyId}/invoices/${invoiceId}`),

  createInvoice: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/invoices`, body),

  updateInvoice: (companyId: string, invoiceId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/invoices/${invoiceId}`, body),

  deleteInvoice: (companyId: string, invoiceId: string) =>
    apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}`),

  // ─── AR Invoices ───────────────────────────────────────────────────────
  listArInvoices: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/invoices`, { params: query }),

  sendArInvoice: (companyId: string, invoiceId: string) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/send`),

  duplicateArInvoice: (companyId: string, invoiceId: string) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/duplicate`),

  voidArInvoice: (companyId: string, invoiceId: string) =>
    apiClient.post(`/companies/${companyId}/ar/invoices/${invoiceId}/void`),

  // ─── AR Recurring Invoices ─────────────────────────────────────────────
  listArRecurringInvoices: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/recurring-invoices`),

  generateRecurringInvoice: (companyId: string, id: string) =>
    apiClient.post(`/companies/${companyId}/ar/recurring-invoices/${id}/generate`),

  updateRecurringInvoice: (companyId: string, id: string, body: { status: string }) =>
    apiClient.put(`/companies/${companyId}/ar/recurring-invoices/${id}`, body),

  batchDeleteRecurringInvoices: (companyId: string, ids: string[]) =>
    apiClient.post(`/companies/${companyId}/ar/recurring-invoices/batch/delete`, { ids }),

  // ─── AR Write-Offs ─────────────────────────────────────────────────────
  listArWriteOffs: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/ar/write-offs`),

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

  // ─── Inventory Items ───────────────────────────────────────────────────
  listInventoryItems: (companyId: string, query?: { limit?: number; type?: string; search?: string }) =>
    apiClient.get(`/companies/${companyId}/inventory/items`, { params: query }),

  deleteInventoryItem: (companyId: string, itemId: string) =>
    apiClient.delete(`/companies/${companyId}/inventory/items/${itemId}`),

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

  // ─── Payments ─────────────────────────────────────────────────────────
  listPayments: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/payments`, { params: query }),

  recordPayment: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/payments`, body),

  voidPayment: (companyId: string, paymentId: string) =>
    apiClient.post(`/companies/${companyId}/payments/${paymentId}/void`),
}

export const arService = {
  // ─── Accounts Receivable ──────────────────────────────────────────────
  listArAging: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ar/reports/aging`, { params: query }),
}
