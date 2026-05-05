'use client'

export type GLPostingTransactionType =
  | 'bill'
  | 'vendorCredit'
  | 'billPayment'
  | 'receipt'
  | 'expenseReport'
  | 'purchaseRequest'
  | 'recurringBill'

export interface GLPostingRule {
  id: string
  transactionType: GLPostingTransactionType
  description: string
  requiredAccountCategories: string[]
  defaultAccount?: string
}

export const GL_POSTING_RULES: GLPostingRule[] = [
  {
    id: 'bill-expense-posting',
    transactionType: 'bill',
    description: 'Bill line items should post to expense or asset accounts, while the bill itself records vendor liability.',
    requiredAccountCategories: ['expense', 'asset'],
    defaultAccount: 'Cost of Goods Sold',
  },
  {
    id: 'vendor-credit-posting',
    transactionType: 'vendorCredit',
    description: 'Vendor credit lines should post to the same expense accounts used for the original purchase, reducing the vendor liability balance.',
    requiredAccountCategories: ['expense', 'asset'],
    defaultAccount: 'Accounts Payable',
  },
  {
    id: 'bill-payment-posting',
    transactionType: 'billPayment',
    description: 'Payments reduce bank accounts and clear the associated bill payable liability.',
    requiredAccountCategories: ['bank', 'liability'],
    defaultAccount: 'Accounts Payable',
  },
  {
    id: 'receipt-posting',
    transactionType: 'receipt',
    description: 'Receipt amounts typically post to expense accounts and can be linked to an expense report for reimbursement.',
    requiredAccountCategories: ['expense'],
    defaultAccount: 'Office Supplies',
  },
  {
    id: 'expense-report-posting',
    transactionType: 'expenseReport',
    description: 'Expense reports collect reimbursable items and post individual lines to the correct expense accounts.',
    requiredAccountCategories: ['expense'],
    defaultAccount: 'Travel Expense',
  },
  {
    id: 'purchase-request-posting',
    transactionType: 'purchaseRequest',
    description: 'Purchase requests should route through purchase or expense accounts, depending on the item type.',
    requiredAccountCategories: ['expense', 'inventory'],
    defaultAccount: 'Purchase Orders',
  },
  {
    id: 'recurring-bill-posting',
    transactionType: 'recurringBill',
    description: 'Recurring bills post repeatedly to the same expense or liability accounts based on the schedule.',
    requiredAccountCategories: ['expense', 'liability'],
    defaultAccount: 'Recurring Expenses',
  },
]

export function getPostingRulesForTransaction(transactionType: GLPostingTransactionType) {
  return GL_POSTING_RULES.filter((rule) => rule.transactionType === transactionType)
}
