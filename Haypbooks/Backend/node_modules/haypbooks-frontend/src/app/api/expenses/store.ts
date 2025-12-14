type Expense = {
  id: string
  date: string
  payee: string
  category: string
  amount: number
  memo?: string
  accountId?: string
}

let EXPENSES: Expense[] = []

export function seedExpenses(data: Expense[]) {
  if (EXPENSES.length === 0) {
    EXPENSES = data.slice()
  }
}

export function listExpenses(): Expense[] {
  return EXPENSES
}

export function upsertExpense(e: Expense): Expense {
  const idx = EXPENSES.findIndex((x) => x.id === e.id)
  if (idx >= 0) EXPENSES[idx] = e
  else EXPENSES.unshift(e)
  return e
}

export function deleteExpense(id: string) {
  EXPENSES = EXPENSES.filter((x) => x.id !== id)
}

export type { Expense }
