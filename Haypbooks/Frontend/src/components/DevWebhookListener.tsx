"use client"
import { useEffect } from 'react'

// Dev-only listener that simulates processing of gateway webhooks by
// receiving BroadcastChannel events sent by the mock checkout page and
// recording a minimal journal entry in localStorage for demo purposes.
export default function DevWebhookListener() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dev = (process.env.NEXT_PUBLIC_DEV_UI === '1' || process.env.NEXT_PUBLIC_GATEWAY_MOCK === '1')
    if (!dev) return

    const bc = new BroadcastChannel('hb.gateway')
    const onMessage = (ev: MessageEvent) => {
      const data = (ev as any).data
      if (!data || typeof data !== 'object') return
      if (data.type === 'payment_succeeded') {
        try {
          const raw = localStorage.getItem('hb.journal')
          const journal: any[] = raw ? JSON.parse(raw) : []
          journal.push({
            kind: 'payment_received',
            invoiceId: data.invoiceId,
            amount: data.amount,
            method: data.method,
            createdAt: data.createdAt || Date.now(),
            // Suggested accounting flow: DR Undeposited Funds / CR A/R
            entries: [
              { account: 'Undeposited Funds', dr: data.amount, cr: 0 },
              { account: 'Accounts Receivable', dr: 0, cr: data.amount }
            ]
          })
          localStorage.setItem('hb.journal', JSON.stringify(journal))
          // Optional: simple toast
          try {
            if ((window as any).toast) (window as any).toast(`Payment recorded for invoice ${data.invoiceId}`)
          } catch {}
          // Also store a flat list for quick demos
          const paidRaw = localStorage.getItem('hb.mockPayments')
          const payments = paidRaw ? JSON.parse(paidRaw) : []
          payments.push({ invoiceId: data.invoiceId, amount: data.amount, method: data.method, ts: Date.now() })
          localStorage.setItem('hb.mockPayments', JSON.stringify(payments))
        } catch {}
      }
    }
    bc.addEventListener('message', onMessage)
    return () => {
      try { bc.removeEventListener('message', onMessage) } catch {}
      try { bc.close() } catch {}
    }
  }, [])
  return null
}
