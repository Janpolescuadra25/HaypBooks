// ─── Frontend API Service: Expenses ─────────────────────────────────────

import apiClient from '@/lib/api-client'

export const expensesService = {
  // ─── Vendors ──────────────────────────────────────────────────────────
  listVendors: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/vendors`, { params: query }),

  getVendor: (companyId: string, vendorId: string) =>
    apiClient.get(`/companies/${companyId}/vendors/${vendorId}`),

  createVendor: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/vendors`, body),

  updateVendor: (companyId: string, vendorId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/vendors/${vendorId}`, body),

  deleteVendor: (companyId: string, vendorId: string) =>
    apiClient.delete(`/companies/${companyId}/vendors/${vendorId}`),

  // ─── Bills ────────────────────────────────────────────────────────────
  listBills: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/bills`, { params: query }),

  getBill: (companyId: string, billId: string) =>
    apiClient.get(`/companies/${companyId}/bills/${billId}`),

  createBill: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/bills`, body),

  updateBill: (companyId: string, billId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/bills/${billId}`, body),

  deleteBill: (companyId: string, billId: string) =>
    apiClient.delete(`/companies/${companyId}/bills/${billId}`),

  // ─── Bill Payments ────────────────────────────────────────────────────
  listBillPayments: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/bill-payments`, { params: query }),

  recordBillPayment: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/bill-payments`, body),

  voidBillPayment: (companyId: string, paymentId: string) =>
    apiClient.post(`/companies/${companyId}/bill-payments/${paymentId}/void`),
}

export const apService = {
  // ─── Accounts Payable ─────────────────────────────────────────────────
  listApAging: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/aging`, { params: query }),
}
