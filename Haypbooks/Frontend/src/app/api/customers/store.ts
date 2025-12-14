export type Address = {
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type Customer = {
  id: string
  // Primary identifiers
  name: string // canonical display name
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  title?: string
  companyName?: string
  printName?: string
  // Contact
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  other?: string
  website?: string
  // Terms & Payments
  terms?: string
  paymentMethod?: string
  deliveryOption?: string
  language?: string
  // Classification & Tax
  customerType?: string
  taxExempt?: boolean
  taxExemptReason?: string
  taxExemptDetails?: string
  taxExemptAsOf?: string
  // Addresses
  billingAddress?: Address
  shippingAddressSame?: boolean
  shippingAddress?: Address
  // Notes
  notes?: string
}

let customers: Customer[] = []

export function seedCustomers(seed: Customer[]) {
  // idempotent merge by id
  const byId = new Map(customers.map((c) => [c.id, c]))
  for (const c of seed) {
    if (!byId.has(c.id)) customers.push(c)
  }
}

export function listCustomers(): Customer[] {
  return customers
}

export function addCustomer(c: Customer): Customer {
  customers.push(c)
  return c
}

export function updateCustomer(id: string, patch: Partial<Customer>): Customer | null {
  const idx = customers.findIndex((c) => c.id === id)
  if (idx === -1) return null
  customers[idx] = { ...customers[idx], ...patch }
  return customers[idx]
}

export function getCustomer(id: string): Customer | null {
  return customers.find((c) => c.id === id) || null
}

export function ensureSampleCustomers(count = 12) {
  if (customers.length === 0) {
    seedCustomers(
      Array.from({ length: count }, (_, i) => ({
        id: `cust_${i + 1}`,
        name: `Customer ${i + 1}`,
        firstName: `Cust${i + 1}`,
        lastName: `Example${i + 1}`,
        companyName: i % 2 === 0 ? `Company ${i + 1}` : undefined,
        terms: ['Net 15','Net 30','Due on receipt'][i % 3],
        email: `customer${i + 1}@example.com`,
        phone: `555-01${(i + 1).toString().padStart(2, '0')}`,
        billingAddress: { line1: `${100 + i} Main St`, city: 'Town', state: 'TX', zip: `75${(i+1).toString().padStart(3,'0')}`, country: 'USA' },
        notes: i % 3 === 0 ? 'VIP' : undefined,
      }))
    )
  }
}
