// ─── Frontend API Service: Expenses (Unified) ─────────────────────────────────
// Single source of truth for ALL expense-module API calls.
// Every page in the expenses module MUST import from here — never use apiClient directly.
//
// URL map (mirrors Backend ap.controller.ts & expenses.controller.ts):
//   Vendors:          /api/companies/:id/ap/vendors
//   Bills:            /api/companies/:id/ap/bills
//   Bill Payments:    /api/companies/:id/ap/bill-payments
//   Purchase Orders:  /api/companies/:id/ap/purchase-orders
//   Purchase Requests:/api/companies/:id/ap/purchase-requests
//   Vendor Credits:   /api/companies/:id/ap/vendor-credits
//   Receipts:         /api/companies/:id/ap/receipts
//   Mileage:          /api/companies/:id/ap/mileage
//   AP Aging:         /api/companies/:id/ap/reports/aging
//   Expense Reports:  /api/companies/:id/expenses
//   Reimbursements:   /api/companies/:id/expenses/reimbursements

import apiClient from '@/lib/api-client'
import type { AxiosResponse } from 'axios'

// ─── Shared query param type ──────────────────────────────────────────────────
export interface ListQuery {
  limit?: number
  offset?: number
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: unknown
}

// ─── Vendor ───────────────────────────────────────────────────────────────────
export interface VendorPayload {
  name: string
  displayName?: string
  status?: string
  type?: string
  taxId?: string
  website?: string
  currency?: string
  contactName?: string
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  billingAddress?: {
    line1?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  paymentTerms?: string
  creditLimit?: number
  openingBalance?: number
  defaultExpenseAccount?: string
  bankName?: string
  bankAccountNumber?: string
  routingNumber?: string
  taxRate?: number
  internalNotes?: string
  publicNotes?: string
}

// ─── Bill ─────────────────────────────────────────────────────────────────────
export interface BillLinePayload {
  description: string
  accountId?: string | null
  quantity?: number
  rate?: number
  amount: number
  taxRate?: number
}

export interface BillPayload {
  vendorId: string
  billNumber?: string
  date?: string
  dueAt?: string
  dueDate?: string
  description?: string
  currency?: string
  paymentTermId?: string
  internalNotes?: string
  lines: BillLinePayload[]
}

// ─── Bill Payment ─────────────────────────────────────────────────────────────
export interface BillPaymentPayload {
  billId?: string
  vendorId?: string
  date?: string
  paymentDate?: string
  amount: number
  method?: string
  reference?: string
  referenceNumber?: string
  memo?: string
  bankAccountId?: string | null
  currency?: string
  applications?: Array<{ billId: string; amount: number; memo?: string | null }>
}

// ─── Purchase Order ───────────────────────────────────────────────────────────
export interface PurchaseOrderLinePayload {
  description: string
  itemId?: string | null
  accountId?: string | null
  qty?: number
  rate?: number
  quantity?: number
  unitPrice?: number
  taxRate?: number
  amount?: number
}

export interface PurchaseOrderPayload {
  vendorId: string
  date?: string
  expectedAt?: string
  status?: string
  shippingMethod?: string
  trackingNumber?: string
  shipTo?: Record<string, string>
  notes?: string
  internalNotes?: string
  lines: PurchaseOrderLinePayload[]
}

// ─── Purchase Request ─────────────────────────────────────────────────────────
export interface PurchaseRequestPayload {
  title?: string
  requestedBy?: string
  requestDate?: string
  requiredDate?: string
  date?: string
  priority?: string
  status?: string
  requesterId?: string
  vendorId?: string
  reason?: string
  notes?: string
  internalNotes?: string
  lines: Array<{
    description: string
    quantity: number
    estimatedCost?: number
    unitPrice?: number
    taxRate?: number
    amount?: number
    accountId?: string | null
  }>
}

// ─── Vendor Credit ────────────────────────────────────────────────────────────
export interface VendorCreditLinePayload {
  description: string
  amount: number
  accountId?: string | null
  quantity?: number
  unitPrice?: number
  taxRate?: number
}

export interface VendorCreditPayload {
  vendorId: string
  date?: string
  creditDate?: string
  referenceBillNumber?: string | null
  creditType?: string
  status?: string
  reason?: string
  lines: VendorCreditLinePayload[]
  memo?: string
  notes?: string
}

// ─── Receipt ─────────────────────────────────────────────────────────────────
export interface ReceiptPayload {
  date?: string
  receiptDate?: string
  merchant?: string
  category?: string
  amount: number
  currency?: string
  description?: string
  employeeId?: string
  accountId?: string | null
  attachmentUrl?: string
  status?: string
  paymentMethod?: string
  referenceNumber?: string | null
  expenseDate?: string
  billable?: boolean
  clientProject?: string | null
  notes?: string
}

// ─── Mileage Log ─────────────────────────────────────────────────────────────
export interface MileageLogPayload {
  date?: string
  logDate?: string
  tripDate?: string
  startLocation?: string
  endLocation?: string
  miles?: number
  distance?: number
  distanceUnit?: string
  rate?: number
  amount?: number
  purpose?: string
  employeeId?: string
  accountId?: string | null
  vehicle?: string
  notes?: string
  status?: string
  billable?: boolean
  clientProject?: string | null
}

// ─── Expense Report (Reimbursement) ──────────────────────────────────────────
export interface ReimbursementLinePayload {
  date?: string
  description: string
  amount: number
  category?: string
  accountId?: string | null
  receiptUrl?: string | null
  billable?: boolean
  subCategoryId?: string
}

export interface ReimbursementPayload {
  employeeId: string
  paymentMethod?: string
  status?: string
  description?: string
  lines: ReimbursementLinePayload[]
}

// ─── Expense Report status update ────────────────────────────────────────────
export interface ExpenseReportUpdatePayload {
  status: 'APPROVED' | 'REJECTED' | 'SUBMITTED'
}

// ─────────────────────────────────────────────────────────────────────────────
// expensesService — THE ONLY WAY pages should call the expenses API
// ─────────────────────────────────────────────────────────────────────────────
export const expensesService = {

  // ─── Vendors ──────────────────────────────────────────────────────────────
  listVendors: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/vendors`, { params: query }),

  getVendor: (companyId: string, vendorId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/vendors/${vendorId}`),

  createVendor: (companyId: string, body: VendorPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/vendors`, body),

  updateVendor: (companyId: string, vendorId: string, body: Partial<VendorPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/vendors/${vendorId}`, body),

  deleteVendor: (companyId: string, vendorId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/vendors/${vendorId}`),

  getVendorActivity: (companyId: string, vendorId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/vendors/${vendorId}/activity`, { params: query }),

  // ─── Bills ────────────────────────────────────────────────────────────────
  listBills: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/bills`, { params: query }),

  getBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/bills/${billId}`),

  createBill: (companyId: string, body: BillPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bills`, body),

  updateBill: (companyId: string, billId: string, body: Partial<BillPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/bills/${billId}`, body),

  deleteBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/bills/${billId}`),

  approveBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/approve`),

  voidBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/void`),

  getBillActivity: (companyId: string, billId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/bills/${billId}/activity`, { params: query }),

  // ─── Bill Payments ────────────────────────────────────────────────────────
  listBillPayments: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/bill-payments`, { params: query }),

  getBillPayment: (companyId: string, paymentId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/bill-payments/${paymentId}`),

  recordBillPayment: (companyId: string, body: BillPaymentPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bill-payments`, body),

  recordBillPaymentForBill: (companyId: string, billId: string, body: BillPaymentPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bills/${billId}/payments`, body),

  voidBillPayment: (companyId: string, paymentId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/bill-payments/${paymentId}/void`),

  // ─── Purchase Orders ───────────────────────────────────────────────────────
  listPurchaseOrders: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/purchase-orders`, { params: query }),

  getPurchaseOrder: (companyId: string, poId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/purchase-orders/${poId}`),

  createPurchaseOrder: (companyId: string, body: PurchaseOrderPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/purchase-orders`, body),

  updatePurchaseOrderStatus: (companyId: string, poId: string, body: { status: string }): Promise<AxiosResponse> =>
    apiClient.patch(`/companies/${companyId}/ap/purchase-orders/${poId}/status`, body),

  convertPurchaseOrderToBill: (companyId: string, poId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/purchase-orders/${poId}/convert`),

  // ─── Purchase Requests ─────────────────────────────────────────────────────
  listPurchaseRequests: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/purchase-requests`, { params: query }),

  getPurchaseRequest: (companyId: string, requestId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/purchase-requests/${requestId}`),

  createPurchaseRequest: (companyId: string, body: PurchaseRequestPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/purchase-requests`, body),

  updatePurchaseRequest: (companyId: string, requestId: string, body: Partial<PurchaseRequestPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/purchase-requests/${requestId}`, body),

  deletePurchaseRequest: (companyId: string, requestId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/purchase-requests/${requestId}`),

  // ─── Vendor Credits ───────────────────────────────────────────────────────
  listVendorCredits: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/vendor-credits`, { params: query }),

  getVendorCredit: (companyId: string, creditId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/vendor-credits/${creditId}`),

  createVendorCredit: (companyId: string, body: VendorCreditPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/vendor-credits`, body),

  updateVendorCredit: (companyId: string, creditId: string, body: Partial<VendorCreditPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/vendor-credits/${creditId}`, body),

  deleteVendorCredit: (companyId: string, creditId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/vendor-credits/${creditId}`),

  applyVendorCredit: (companyId: string, creditId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/vendor-credits/${creditId}/apply`),

  // ─── Receipts ────────────────────────────────────────────────────────────
  listReceipts: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/receipts`, { params: query }),

  getReceipt: (companyId: string, receiptId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/receipts/${receiptId}`),

  createReceipt: (companyId: string, body: ReceiptPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/receipts`, body),

  updateReceipt: (companyId: string, receiptId: string, body: Partial<ReceiptPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/receipts/${receiptId}`, body),

  deleteReceipt: (companyId: string, receiptId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/receipts/${receiptId}`),

  // ─── Mileage Logs ─────────────────────────────────────────────────────────
  listMileageLogs: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/mileage`, { params: query }),

  getMileageLog: (companyId: string, logId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/mileage/${logId}`),

  createMileageLog: (companyId: string, body: MileageLogPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/mileage`, body),

  updateMileageLog: (companyId: string, logId: string, body: Partial<MileageLogPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/mileage/${logId}`, body),

  deleteMileageLog: (companyId: string, logId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/mileage/${logId}`),

  // ─── AP Aging Report ──────────────────────────────────────────────────────
  listApAging: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/reports/aging`, { params: query }),

  // ─── Expense Reports ─────────────────────────────────────────────────────
  listExpenseReports: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/expenses`, { params: query }),

  getExpenseReport: (companyId: string, expenseId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/expenses/${expenseId}`),

  createExpenseReport: (companyId: string, body: ReimbursementPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses`, body),

  submitExpenseReport: (companyId: string, expenseId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/submit`),

  approveExpenseReport: (companyId: string, expenseId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/approve`),

  reimburseExpenseReport: (companyId: string, expenseId: string, body: { method: string }): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/reimburse`, body),

  updateExpenseReport: (companyId: string, expenseId: string, body: ExpenseReportUpdatePayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}`, body),

  // ─── Reimbursements ───────────────────────────────────────────────────────
  listReimbursements: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/expenses/reimbursements`, { params: query }),

  getReimbursement: (companyId: string, reimbursementId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/expenses/reimbursements/${reimbursementId}`),

  createReimbursement: (companyId: string, body: ReimbursementPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/reimbursements`, body),

  updateReimbursement: (companyId: string, reimbursementId: string, body: Partial<ReimbursementPayload>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/reimbursements/${reimbursementId}`, body),

  // ─── RFQ ──────────────────────────────────────────────────────────────────
  listRfqs: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/rfqs`, { params: query }),

  getRfq: (companyId: string, rfqId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/rfqs/${rfqId}`),

  createRfq: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/rfqs`, body),

  updateRfq: (companyId: string, rfqId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/rfqs/${rfqId}`, body),

  // ─── Recurring Bills ──────────────────────────────────────────────────────
  listRecurringBills: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/recurring-bills`, { params: query }),

  getRecurringBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/recurring-bills/${billId}`),

  createRecurringBill: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/recurring-bills`, body),

  updateRecurringBill: (companyId: string, billId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/recurring-bills/${billId}`, body),

  // ─── Payment Runs ─────────────────────────────────────────────────────────
  listPaymentRuns: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/payment-runs`, { params: query }),

  getPaymentRun: (companyId: string, runId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/payment-runs/${runId}`),

  createPaymentRun: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/payment-runs`, body),

  processPaymentRun: (companyId: string, runId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/payment-runs/${runId}/process`),

  // ─── Per Diem ─────────────────────────────────────────────────────────────
  listPerDiem: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/per-diem`, { params: query }),

  getPerDiem: (companyId: string, perDiemId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/per-diem/${perDiemId}`),

  createPerDiem: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/per-diem`, body),

  updatePerDiem: (companyId: string, perDiemId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/per-diem/${perDiemId}`, body),

  // ─── Payroll Employees (shared lookup) ───────────────────────────────────
  listEmployees: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/payroll/employees`, { params: query }),

  createEmployee: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/payroll/employees`, body),
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-export apService as a named alias on expensesService for legacy compat.
// Prefer expensesService.listApAging() in new code.
// ─────────────────────────────────────────────────────────────────────────────
/** @deprecated Use expensesService.listApAging() instead */
export const apService = {
  listApAging: expensesService.listApAging,
}
