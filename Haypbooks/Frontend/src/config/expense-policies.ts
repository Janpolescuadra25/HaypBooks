export interface ExpensePolicy {
  title: string
  reminders: string[]
}

export const defaultExpensePolicies: ExpensePolicy[] = [
  {
    title: 'Important Policy Reminders',
    reminders: [
      'Receipts required for all items over $25.00',
      'Travel must be pre-authorized by department head',
      'All entries must include a specific business purpose',
      'Late submissions (>60 days) may be rejected',
    ],
  },
]
