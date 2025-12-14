import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { cookies } from 'next/headers'
import { logEvent } from '@/lib/audit'
import { addCustomer, ensureSampleCustomers, listCustomers, Customer } from './store'
import { z } from 'zod'

// Server-side schema allows minimal legacy payload (name only) or full structured form
const serverSchema = z.object({
  // Identification / display
  name: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().max(50).optional(),
  firstName: z.string().trim().max(80).optional(),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  suffix: z.string().trim().max(20).optional(),
  companyName: z.string().trim().max(120).optional(),
  displayName: z.string().trim().max(140).optional(),
  printName: z.string().trim().max(140).optional(),
  // Contact
  email: z.string().email().optional(),
  phone: z.string().trim().max(40).optional(),
  mobile: z.string().trim().max(40).optional(),
  fax: z.string().trim().max(40).optional(),
  other: z.string().trim().max(140).optional(),
  website: z.string().trim().url().optional(),
  // Terms & payments
  terms: z.string().trim().max(40).optional(),
  paymentMethod: z.string().trim().max(60).optional(),
  deliveryOption: z.string().trim().max(60).optional(),
  language: z.string().trim().max(40).optional(),
  // Classification & tax
  customerType: z.string().trim().max(60).optional(),
  taxExempt: z.boolean().optional(),
  taxExemptReason: z.string().trim().max(120).optional(),
  taxExemptDetails: z.string().trim().max(240).optional(),
  taxExemptAsOf: z.string().trim().optional(),
  // Addresses
  billingAddress: z.object({
    line1: z.string().trim().max(120).optional(),
    line2: z.string().trim().max(120).optional(),
    city: z.string().trim().max(80).optional(),
    state: z.string().trim().max(40).optional(),
    zip: z.string().trim().max(30).optional(),
    country: z.string().trim().max(60).optional(),
  }).optional(),
  shippingAddressSame: z.boolean().optional(),
  shippingAddress: z.object({
    line1: z.string().trim().max(120).optional(),
    line2: z.string().trim().max(120).optional(),
    city: z.string().trim().max(80).optional(),
    state: z.string().trim().max(40).optional(),
    zip: z.string().trim().max(30).optional(),
    country: z.string().trim().max(60).optional(),
  }).optional(),
  // Notes
  notes: z.string().trim().max(500).optional(),
}).superRefine((obj, ctx) => {
  if (obj.taxExempt) {
    if (!obj.taxExemptReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tax exemption reason required', path: ['taxExemptReason'] })
  }
})

function resolveDisplayName(p: any): string {
  if (p.displayName) return p.displayName
  const parts = [p.firstName, p.middleName, p.lastName].filter(Boolean)
  if (parts.length) return parts.join(' ')
  if (p.companyName) return p.companyName
  if (p.name) return p.name
  return 'Unnamed Customer'
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  ensureSampleCustomers()
  const all = listCustomers()
  const list = q ? all.filter(c => c.name.toLowerCase().includes(q)) : all
  return NextResponse.json({ customers: list })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const raw = await req.json().catch(() => ({}))
  const parsed = serverSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }
  const p = parsed.data
  const displayName = resolveDisplayName(p)
  ensureSampleCustomers()
  const id = `cust_${Math.random().toString(36).slice(2, 8)}`
  // Legacy compatibility: canonical name field keeps displayName
  const customer: Customer = {
    id,
    name: displayName,
    firstName: p.firstName,
    middleName: p.middleName,
    lastName: p.lastName,
    suffix: p.suffix,
    title: p.title,
    companyName: p.companyName,
    printName: p.printName || displayName,
    email: p.email,
    phone: p.phone,
    mobile: p.mobile,
    fax: p.fax,
    other: p.other,
    website: p.website,
    terms: p.terms,
    paymentMethod: p.paymentMethod,
    deliveryOption: p.deliveryOption,
    language: p.language,
    customerType: p.customerType,
    taxExempt: p.taxExempt,
    taxExemptReason: p.taxExemptReason,
    taxExemptDetails: p.taxExemptDetails,
    taxExemptAsOf: p.taxExemptAsOf,
    billingAddress: p.billingAddress,
    shippingAddressSame: p.shippingAddressSame,
    shippingAddress: p.shippingAddress,
    notes: p.notes,
  }
  const created = addCustomer(customer)
  const userId = cookies().get('userId')?.value || 'u_anon'
  logEvent({ userId, action: 'customer:create', entity: 'customer', entityId: id, meta: { name: displayName } })
  return NextResponse.json({ customer: created })
}
