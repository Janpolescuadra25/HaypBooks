// Foundational expense-related TypeScript types
// Use these as the canonical frontend shapes for expense reports, lines,
// reimbursements and lightweight references.

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REIMBURSED'
  | 'PAID'
  | 'VOIDED'

export type Currency = string

export interface Attachment {
  id?: string
  url: string
  fileName?: string | null
  contentType?: string | null
  size?: number | null
  uploadedAt?: string | null
}

export interface ExpenseLine {
  id?: string
  date?: string | null
  description: string
  amount: number
  accountId?: string | null
  receiptUrl?: string | null
  category?: string | null
  billable?: boolean
  subCategoryId?: string | null
  taxRate?: number | null
}

export interface ExpenseReport {
  id?: string
  employeeId: string
  status?: ExpenseStatus
  description?: string | null
  currency?: Currency | null
  totalAmount?: number | null
  lines: ExpenseLine[]
  attachments?: Attachment[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface Reimbursement {
  id?: string
  employeeId: string
  method?: string | null
  amount?: number | null
  status?: ExpenseStatus
  createdAt?: string | null
  updatedAt?: string | null
}

export interface VendorRef {
  id: string
  name?: string | null
}

export interface PurchaseOrderRef {
  id: string
  poNumber?: string | null
}

export interface GLAccountRef {
  id: string
  name?: string | null
  accountCode?: string | null
}

export interface ListQuery {
  limit?: number
  offset?: number
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: unknown
}
