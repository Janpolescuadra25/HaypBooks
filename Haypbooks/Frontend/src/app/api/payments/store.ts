export type PaymentsSettings = {
  enabled: boolean
  processor: string
  methods: string[]
}

const state: PaymentsSettings = {
  enabled: true,
  processor: 'Stripe',
  methods: ['Card', 'ACH']
}

export function getSettings(): PaymentsSettings {
  return state
}

export function setEnabled(v: boolean) {
  state.enabled = v
}

export function setProcessor(p: string) {
  state.processor = p
}
