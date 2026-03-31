// ─── Frontend API Service: Sales ────────────────────────────────────────

import apiClient from '@/lib/api-client'

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
    apiClient.get(`/companies/${companyId}/ar/aging`, { params: query }),
}
