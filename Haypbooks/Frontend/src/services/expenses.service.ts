// ─── Frontend API Service: Expenses ─────────────────────────────────────

import apiClient from '@/lib/api-client'

export const expensesService = {
  // ─── Vendors ──────────────────────────────────────────────────────────
  listVendors: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/vendors`, { params: query }),

  getVendor: (companyId: string, vendorId: string) =>
    apiClient.get(`/companies/${companyId}/ap/vendors/${vendorId}`),

  createVendor: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/vendors`, body),

  updateVendor: (companyId: string, vendorId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/vendors/${vendorId}`, body),

  deleteVendor: (companyId: string, vendorId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/vendors/${vendorId}`),

  getVendorActivity: (companyId: string, vendorId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/vendors/${vendorId}/activity`, { params: query }),

  // ─── Bills ────────────────────────────────────────────────────────────
  listBills: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/bills`, { params: query }),

  getBill: (companyId: string, billId: string) =>
    apiClient.get(`/companies/${companyId}/ap/bills/${billId}`),

  createBill: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/bills`, body),

  updateBill: (companyId: string, billId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/bills/${billId}`, body),

  deleteBill: (companyId: string, billId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/bills/${billId}`),

  approveBill: (companyId: string, billId: string) =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/approve`),

  voidBill: (companyId: string, billId: string) =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/void`),

  getBillActivity: (companyId: string, billId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/bills/${billId}/activity`, { params: query }),

  // ─── Bill Payments ────────────────────────────────────────────────────
  listBillPayments: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/bill-payments`, { params: query }),

  recordBillPayment: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/bill-payments`, body),

  recordBillPaymentForBill: (companyId: string, billId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/payments`, body),

  voidBillPayment: (companyId: string, paymentId: string) =>
    apiClient.post(`/companies/${companyId}/ap/bill-payments/${paymentId}/void`),

  getBillPayment: (companyId: string, paymentId: string) =>
    apiClient.get(`/companies/${companyId}/ap/bill-payments/${paymentId}`),

  // ─── Purchase Orders ───────────────────────────────────────────────────
  listPurchaseOrders: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/purchase-orders`, { params: query }),

  createPurchaseOrder: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/purchase-orders`, body),

  getPurchaseOrder: (companyId: string, poId: string) =>
    apiClient.get(`/companies/${companyId}/ap/purchase-orders/${poId}`),

  updatePurchaseOrderStatus: (companyId: string, poId: string, body: any) =>
    apiClient.patch(`/companies/${companyId}/ap/purchase-orders/${poId}/status`, body),

  convertPurchaseOrderToBill: (companyId: string, poId: string) =>
    apiClient.post(`/companies/${companyId}/ap/purchase-orders/${poId}/convert`),

  listExpenseReports: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/expenses`, { params: query }),

  getExpenseReport: (companyId: string, expenseId: string) =>
    apiClient.get(`/companies/${companyId}/expenses/${expenseId}`),

  createExpenseReport: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/expenses`, body),

  submitExpenseReport: (companyId: string, expenseId: string) =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/submit`),

  approveExpenseReport: (companyId: string, expenseId: string) =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/approve`),

  reimburseExpenseReport: (companyId: string, expenseId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/reimburse`, body),

  listReimbursements: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/reimbursements`, { params: query }),

  listEmployees: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/payroll/employees`, { params: query }),

  createEmployee: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/payroll/employees`, body),
}

export const apService = {
  // ─── Accounts Payable ─────────────────────────────────────────────────
  listApAging: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/reports/aging`, { params: query }),
}
