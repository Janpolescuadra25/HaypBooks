// Separate store for receipts to avoid exporting data bindings from route handlers (improves Next type inference)
export type Receipt = {
  id: string
  date: string
  vendor: string
  amount: number
  currency?: string
  method?: 'upload' | 'email' | 'manual' | 'capture'
  status?: 'uploaded' | 'parsed' | 'matched' | 'posted'
  matchedTransactionId?: string
  attachment?: { name: string; size: number }
  createdBy?: string
  createdAt?: string
  postedAt?: string
  postedJournalId?: string
  expenseAccountNumber?: string
  expenseId?: string
  // OCR stub extraction (populated during parse)
  ocrExtract?: { vendor?: string; date?: string; amount?: number }
  // Suggested match id if auto-match heuristics find a unique candidate
  suggestedMatchTransactionId?: string
}

let receipts: Receipt[] = []

export function listReceipts() { return receipts }
export function addReceipt(r: Receipt) { receipts.unshift(r) }
export function findReceipt(id: string) { return receipts.find(r => r.id === id) }
export function deleteReceipt(id: string) { receipts = receipts.filter(r => r.id !== id) }
export function updateReceipt(r: Receipt) {
  const idx = receipts.findIndex(x => x.id === r.id)
  if (idx >= 0) receipts[idx] = r
}
export function mutateReceipt(id: string, fn: (r: Receipt) => void) { const r = findReceipt(id); if (r) fn(r) }
export function replaceAll(list: Receipt[]) { receipts = list.slice() }
