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

  listPurchaseRequests: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/purchase-requests`, { params: query }),

  getPurchaseRequest: (companyId: string, requestId: string) =>
    apiClient.get(`/companies/${companyId}/ap/purchase-requests/${requestId}`),

  createPurchaseRequest: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/purchase-requests`, body),

  updatePurchaseRequest: (companyId: string, requestId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/purchase-requests/${requestId}`, body),

  deletePurchaseRequest: (companyId: string, requestId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/purchase-requests/${requestId}`),

  listVendorCredits: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/vendor-credits`, { params: query }),

  getVendorCredit: (companyId: string, creditId: string) =>
    apiClient.get(`/companies/${companyId}/ap/vendor-credits/${creditId}`),

  createVendorCredit: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/vendor-credits`, body),

  updateVendorCredit: (companyId: string, creditId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/vendor-credits/${creditId}`, body),

  deleteVendorCredit: (companyId: string, creditId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/vendor-credits/${creditId}`),

  applyVendorCredit: (companyId: string, creditId: string) =>
    apiClient.post(`/companies/${companyId}/ap/vendor-credits/${creditId}/apply`),

  listReceipts: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/receipts`, { params: query }),

  getReceipt: (companyId: string, receiptId: string) =>
    apiClient.get(`/companies/${companyId}/ap/receipts/${receiptId}`),

  createReceipt: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/receipts`, body),

  updateReceipt: (companyId: string, receiptId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/receipts/${receiptId}`, body),

  deleteReceipt: (companyId: string, receiptId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/receipts/${receiptId}`),

  listMileageLogs: (companyId: string, query?: any) =>
    apiClient.get(`/companies/${companyId}/ap/mileage`, { params: query }),

  getMileageLog: (companyId: string, logId: string) =>
    apiClient.get(`/companies/${companyId}/ap/mileage/${logId}`),

  createMileageLog: (companyId: string, body: any) =>
    apiClient.post(`/companies/${companyId}/ap/mileage`, body),

  updateMileageLog: (companyId: string, logId: string, body: any) =>
    apiClient.put(`/companies/${companyId}/ap/mileage/${logId}`, body),

  deleteMileageLog: (companyId: string, logId: string) =>
    apiClient.delete(`/companies/${companyId}/ap/mileage/${logId}`),

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
