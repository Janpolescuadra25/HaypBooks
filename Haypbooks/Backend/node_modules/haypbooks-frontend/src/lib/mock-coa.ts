export type CoaAccount = {
  id: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'
  number?: string
}

const DEFAULT_COA: CoaAccount[] = [
  { id: '1000', name: 'Checking', type: 'Asset', number: '1000' },
  { id: '1010', name: 'Savings', type: 'Asset', number: '1010' },
  { id: '1020', name: 'Undeposited Funds', type: 'Asset', number: '1020' },
  { id: '1100', name: 'Accounts Receivable', type: 'Asset', number: '1100' },
  { id: '2000', name: 'Accounts Payable', type: 'Liability', number: '2000' },
  { id: '3000', name: 'Owner’s Equity', type: 'Equity', number: '3000' },
  { id: '4000', name: 'Sales', type: 'Income', number: '4000' },
  { id: '4010', name: 'Service Revenue', type: 'Income', number: '4010' },
  { id: '5000', name: 'Payments Fees', type: 'Expense', number: '5000' },
  { id: '5010', name: 'Bank Service Charges', type: 'Expense', number: '5010' },
]

export function listMockCoa(): CoaAccount[] {
  try {
    const raw = localStorage.getItem('hb.mock.coa')
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_COA
}

export function filterCoa(query: string, base: CoaAccount[] = listMockCoa()) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return base
  return base.filter(a =>
    a.name.toLowerCase().includes(q) || (a.number || '').toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
  )
}
