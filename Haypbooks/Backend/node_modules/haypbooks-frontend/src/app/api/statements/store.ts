export type Statement = {
  id: string
  customer: string
  date: string // YYYY-MM-DD
  amountDue: number
  status: 'open' | 'paid' | 'overdue'
}

let statements: Statement[] = []

export function listStatements(): Statement[] {
  return statements
}

export function upsertStatement(s: Statement) {
  const idx = statements.findIndex((x) => x.id === s.id)
  if (idx === -1) statements.push(s)
  else statements[idx] = s
  return s
}

export function ensureSampleStatements(count = 8) {
  if (statements.length > 0) return
  const today = new Date().toISOString().slice(0, 10)
  for (let i = 1; i <= count; i++) {
    const amt = 100 * i + (i % 3 === 0 ? 50 : 0)
    const status: Statement['status'] = i % 5 === 0 ? 'overdue' : i % 2 === 0 ? 'paid' : 'open'
    upsertStatement({ id: `stmt_${i}`, customer: `Customer ${i}`, date: today, amountDue: amt, status })
  }
}
