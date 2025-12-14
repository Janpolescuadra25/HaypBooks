// Mock payment gateway abstraction for dev/demo only.
// Provides a minimal in-memory (localStorage) interface resembling a third-party SDK.

export interface GatewayMethod {
  id: string
  label: string
  type: 'card' | 'ach' | 'wallet' | 'other'
  enabled: boolean
}

export interface PaymentIntent {
  id: string
  invoiceId: string
  amount: number
  currency: string
  method?: string
  status: 'requires_method' | 'requires_capture' | 'succeeded' | 'canceled'
  createdAt: number
  updatedAt: number
}

const LS_KEY = 'hb.gateway.mock.intents'

function loadIntents(): PaymentIntent[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function saveIntents(list: PaymentIntent[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {}
}

function genId(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2,10)}` }

export function listMethods(): GatewayMethod[] {
  return [
    { id: 'card', label: 'Credit / Debit Card', type: 'card', enabled: true },
    { id: 'ach', label: 'Bank Transfer (ACH)', type: 'ach', enabled: true },
    { id: 'applepay', label: 'Apple Pay', type: 'wallet', enabled: true },
  ]
}

export function createIntent(params: { invoiceId: string; amount: number; currency?: string }): PaymentIntent {
  const intents = loadIntents()
  const intent: PaymentIntent = {
    id: genId('pi'),
    invoiceId: params.invoiceId,
    amount: params.amount,
    currency: params.currency || 'USD',
    status: 'requires_method',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  intents.push(intent)
  saveIntents(intents)
  return intent
}

export function attachMethod(intentId: string, method: string): PaymentIntent | null {
  const intents = loadIntents()
  const i = intents.find(x => x.id === intentId)
  if (!i) return null
  i.method = method
  i.status = 'requires_capture'
  i.updatedAt = Date.now()
  saveIntents(intents)
  return i
}

export function captureIntent(intentId: string): PaymentIntent | null {
  const intents = loadIntents()
  const i = intents.find(x => x.id === intentId)
  if (!i) return null
  if (i.status !== 'requires_capture') return i
  i.status = 'succeeded'
  i.updatedAt = Date.now()
  saveIntents(intents)
  // Emit a synthetic webhook-esque event for our dev listener
  try {
    const bc = new BroadcastChannel('hb.gateway')
    bc.postMessage({ type: 'payment_succeeded', invoiceId: i.invoiceId, amount: i.amount, method: i.method || 'card', createdAt: i.updatedAt })
    bc.close()
  } catch {}
  return i
}

export function cancelIntent(intentId: string): PaymentIntent | null {
  const intents = loadIntents()
  const i = intents.find(x => x.id === intentId)
  if (!i) return null
  i.status = 'canceled'
  i.updatedAt = Date.now()
  saveIntents(intents)
  return i
}

export function listIntents(): PaymentIntent[] { return loadIntents().sort((a,b)=>a.createdAt-b.createdAt) }

export function clearIntents() { saveIntents([]) }

export function recordSucceededDirect(invoiceId: string, amount: number, method: string) {
  // Helper to record a success if we bypass explicit intent flow
  const intent = createIntent({ invoiceId, amount })
  attachMethod(intent.id, method)
  captureIntent(intent.id)
}
