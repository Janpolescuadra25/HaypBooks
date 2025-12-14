export type BSItem = { name: string; amount: number }
export type BSPayload = {
  period: string
  assets: BSItem[]
  liabilities: BSItem[]
  equity: BSItem[]
  totals: { assets: number; liabilities: number; equity: number }
  balanced: boolean
  prev?: {
    assets: BSItem[]
    liabilities: BSItem[]
    equity: BSItem[]
    totals: { assets: number; liabilities: number; equity: number }
  }
}

export function getBalanceSheet(period: string = 'YTD', compare: boolean = false): BSPayload {
  const assets: BSItem[] = [
    { name: 'Cash', amount: 54000 },
    { name: 'Accounts Receivable', amount: 32000 },
    { name: 'Inventory', amount: 18000 },
  ]
  const liabilities: BSItem[] = [
    { name: 'Accounts Payable', amount: 22000 },
    { name: 'Credit Card', amount: 8000 },
  ]
  const equity: BSItem[] = [
    { name: 'Owner’s Equity', amount: 50000 },
    { name: 'Retained Earnings', amount: 14000 },
  ]

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0)
  const totalLiabilities = liabilities.reduce((s, a) => s + a.amount, 0)
  const totalEquity = equity.reduce((s, a) => s + a.amount, 0)

  const payload: BSPayload = {
    period,
    assets,
    liabilities,
    equity,
    totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity },
    balanced: Math.round((totalAssets - (totalLiabilities + totalEquity)) * 100) === 0,
  }

  if (compare) {
    const prevAssets = assets.map((a) => ({ ...a, amount: Math.round(a.amount * 0.95) }))
    const prevLiabilities = liabilities.map((l) => ({ ...l, amount: Math.round(l.amount * 0.97) }))
    const prevEquity = equity.map((e) => ({ ...e, amount: Math.round(e.amount * 0.96) }))
    const pA = prevAssets.reduce((s, a) => s + a.amount, 0)
    const pL = prevLiabilities.reduce((s, a) => s + a.amount, 0)
    const pE = prevEquity.reduce((s, a) => s + a.amount, 0)
    payload.prev = {
      assets: prevAssets,
      liabilities: prevLiabilities,
      equity: prevEquity,
      totals: { assets: pA, liabilities: pL, equity: pE },
    }
  }

  return payload
}
