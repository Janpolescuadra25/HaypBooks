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
  attachmentUrl?: string | null
  status?: string
  paymentMethod?: string
  referenceNumber?: string | null
  expenseDate?: string
  billable?: boolean
  clientProject?: string | null
  notes?: string
  expenseReportId?: string | null
}

// ─── Mileage Log ─────────────────────────────────────────────────────────────
export interface MileageLogPayload {
  logNumber?: string | null
  logDate?: string
  tripDate?: string
  fromLocation?: string
  toLocation?: string
  miles?: number
  distanceUnit?: string
  ratePerMile?: number
  amount?: number
  purpose?: string
  employeeId?: string
  accountId?: string | null
  vehicle?: string
  personalVehicle?: boolean
  notes?: string
  status?: string
  isBillable?: boolean
  projectId?: string | null
}

export interface PerDiemPayload {
  employeeId: string
  perDiemNumber?: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  days: number
  dailyRate: number
  totalAmount: number
  currency?: string
  status?: string
  notes?: string
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
  businessPurpose?: string | null
  notes?: string | null
  internalNotes?: string | null
  fromDate?: string
  toDate?: string
  advancePayment?: number
  lines: ReimbursementLinePayload[]
}

export interface ExpenseReportLinePayload {
  date?: string
  category?: string
  vendor?: string
  description?: string
  accountId?: string | null
  amount: number
  receiptUrl?: string | null
  receiptName?: string | null
  billable?: boolean
}

export interface ExpenseReportPayload {
  employeeId: string
  departmentId?: string | null
  description?: string
  businessPurpose?: string
  fromDate?: string
  toDate?: string
  lines?: ExpenseReportLinePayload[]
  advancePayment?: number
  notes?: string
  internalNotes?: string
  attachments?: Array<{ fileUrl?: string | null; fileName?: string; mimeType?: string | null; fileSize?: number | null }>
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'VOID'
}

export type ExpenseReportUpdatePayload = Partial<ExpenseReportPayload> & {
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'VOID'
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

  deletePurchaseOrder: (companyId: string, poId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/purchase-orders/${poId}`),

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

  // ─── Organization (shared) ──────────────────────────────────────────────────
  listDepartments: (companyId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/organization/departments`),

  listLocations: (companyId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/organization/locations`),

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

  uploadReceipt: (companyId: string, file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/companies/${companyId}/ap/receipts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data)
  },

  uploadAttachment: (companyId: string, file: File, entityType: string, entityId: string, description?: string): Promise<AxiosResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)
    formData.append('entityId', entityId)
    if (description) formData.append('description', description)
    return apiClient.post(`/companies/${companyId}/attachments/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  listAttachments: (companyId: string, entityType: string, entityId: string): Promise<AxiosResponse> =>
    apiClient.get(`/attachments`, { params: { tenantId: companyId, entityType, entityId } }),

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

  createExpenseReport: (companyId: string, body: ExpenseReportPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses`, body),

  submitExpenseReport: (companyId: string, expenseId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/submit`),

  approveExpenseReport: (companyId: string, expenseId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/approve`),

  reimburseExpenseReport: (companyId: string, expenseId: string, body: { method: string }): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/expenses/${expenseId}/reimburse`, body),

  updateExpenseReport: (companyId: string, expenseId: string, body: ExpenseReportUpdatePayload): Promise<AxiosResponse> =>
    apiClient.patch(`/companies/${companyId}/expenses/${expenseId}`, body),

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

  deleteRecurringBill: (companyId: string, billId: string): Promise<AxiosResponse> =>
    apiClient.delete(`/companies/${companyId}/ap/recurring-bills/${billId}`),

  // ─── Payment Runs ─────────────────────────────────────────────────────────
  listPaymentRuns: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/payment-runs`, { params: query }),

  getPaymentRun: (companyId: string, runId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/payment-runs/${runId}`),

  createPaymentRun: (companyId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/payment-runs`, body),

  processPaymentRun: (companyId: string, runId: string): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/payment-runs/${runId}/process`),

  updatePaymentRun: (companyId: string, runId: string, body: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.patch(`/companies/${companyId}/ap/payment-runs/${runId}`, body),

  // ─── Per Diem ─────────────────────────────────────────────────────────────
  listPerDiem: (companyId: string, query?: ListQuery): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/per-diem`, { params: query }),

  getPerDiem: (companyId: string, perDiemId: string): Promise<AxiosResponse> =>
    apiClient.get(`/companies/${companyId}/ap/per-diem/${perDiemId}`),

  createPerDiem: (companyId: string, body: PerDiemPayload): Promise<AxiosResponse> =>
    apiClient.post(`/companies/${companyId}/ap/per-diem`, body),

  updatePerDiem: (companyId: string, perDiemId: string, body: Partial<PerDiemPayload>): Promise<AxiosResponse> =>
    apiClient.put(`/companies/${companyId}/ap/per-diem/${perDiemId}`, body),

  deletePerDiem: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/ap/per-diem/${id}`),

  deleteReimbursement: (companyId: string, id: string) =>
    apiClient.delete(`/companies/${companyId}/expenses/reimbursements/${id}`),

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
