import { NextResponse } from 'next/server'
import { db } from '@/mock/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Try to find an actual posted journal in mock db
  const je = (db.journalEntries || []).find(j => j.id === id)
  if (je) {
    const lines = je.lines.map(l => {
      const acc = db.accounts.find(a => a.id === l.accountId)
      const number = acc?.number || '0000'
      const name = acc?.name || 'Unknown'
      return { account: `${number} · ${name}`, name: '', memo: l.memo || '', debit: l.debit || 0, credit: l.credit || 0 }
    })
    const totals = lines.reduce((acc, l) => ({ debit: acc.debit + (l.debit || 0), credit: acc.credit + (l.credit || 0) }), { debit: 0, credit: 0 })
    const journal: any = {
      id: je.id,
      number: `JE-${je.id.split('_').pop()}`,
      date: je.date,
      memo: '',
      totals,
      lines,
      reversing: je.reversing ? { enabled: true, date: je.date, reversingEntryId: je.reversesEntryId } : { enabled: false },
      recurring: { enabled: false },
      attachments: [],
      linkedType: je.linkedType,
      linkedId: je.linkedId,
      reversesEntryId: je.reversesEntryId,
    }
    return NextResponse.json({ journal })
  }

  // Fallback: deterministic mock from id last char
  const n = Math.max(1, (parseInt(id.replace(/\D/g, '').slice(-1) || '3', 10) % 9) + 1)
  const amount = 100 + n * 10
  const journal = {
    id,
    number: `JE-${100000 + n}`,
    date: new Date(Date.now() - n * 86400000).toISOString(),
    memo: `Sample journal ${n}`,
    totals: { debit: amount, credit: amount },
    lines: [
      { account: '1000 · Cash', name: 'Bank', memo: 'Deposit', debit: amount, credit: 0 },
      { account: '4000 · Sales Revenue', name: 'Customer', memo: 'Sale', debit: 0, credit: amount },
    ],
    reversing: n % 2 === 0 ? { enabled: true, date: new Date(Date.now() + 86400000).toISOString() } : { enabled: false },
    recurring: n % 3 === 0 ? { enabled: true, frequency: 'monthly' as const, count: 3, schedule: [] } : { enabled: false },
    attachments: [{ name: 'receipt.pdf', size: 20480 }],
  }

  return NextResponse.json({ journal })
}
