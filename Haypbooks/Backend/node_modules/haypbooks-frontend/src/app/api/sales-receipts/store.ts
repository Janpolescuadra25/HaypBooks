export type SalesReceipt = {
  id: string
  date: string
  customer: string
  description?: string
  amount: number
}

let _receipts: SalesReceipt[] = []

export function seedSalesReceipts(list: SalesReceipt[]) {
  if (_receipts.length === 0) _receipts = list
}

export function listSalesReceipts() {
  return _receipts.slice()
}

export function upsertSalesReceipt(r: SalesReceipt) {
  const idx = _receipts.findIndex(x => x.id === r.id)
  if (idx >= 0) _receipts[idx] = r
  else _receipts.push(r)
  return r
}

export function deleteSalesReceipt(id: string) {
  _receipts = _receipts.filter(x => x.id !== id)
}

export function getSalesReceipt(id: string) {
  return _receipts.find(x => x.id === id)
}
