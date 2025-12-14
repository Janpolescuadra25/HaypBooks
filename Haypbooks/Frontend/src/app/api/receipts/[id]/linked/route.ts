import { NextRequest } from 'next/server'
import { findReceipt } from '../../store'
import { getInvoice } from '@/app/api/invoices/store'
import { getBill } from '@/app/api/bills/store'

// RBAC helper (mirrors existing pattern used in other routes)
function getRole(req: NextRequest): string {
  return req.headers.get('x-role') || 'viewer'
}
function canRead(role: string) { return role === 'admin' || role === 'staff' || role === 'manager' || role === 'analyst' || role === 'viewer' }

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const role = getRole(req)
  if (!canRead(role)) return new Response('forbidden', { status: 403 })

  const receipt = findReceipt(params.id)
  if (!receipt) return new Response('not found', { status: 404 })
  if (!receipt.matchedTransactionId) return new Response('receipt not matched', { status: 409 })

  // Try invoice first, then bill
  const inv = getInvoice(receipt.matchedTransactionId)
  if (inv) {
    const amountOpen = inv.status === 'paid' ? 0 : inv.total - (inv.payments?.reduce((s, p) => s + p.amount, 0) || 0)
    return Response.json({ linked: {
      type: 'invoice',
      id: inv.id,
      number: inv.number,
      date: inv.date,
      vendorOrCustomer: inv.customer,
      status: inv.status,
      amountOriginal: inv.total,
      amountOpen,
      lineCount: inv.items?.length || 0,
      currency: 'USD'
    } })
  }
  const bill = getBill(receipt.matchedTransactionId)
  if (bill) {
    const paid = bill.payments?.reduce((s, p) => s + p.amount, 0) || 0
    const amountOpen = bill.status === 'paid' ? 0 : bill.total - paid
    return Response.json({ linked: {
      type: 'bill',
      id: bill.id,
      number: bill.number,
      date: bill.dueDate, // using dueDate for simplified display; future: separate date field
      dueDate: bill.dueDate,
      vendorOrCustomer: bill.vendor,
      status: bill.status,
      amountOriginal: bill.total,
      amountOpen,
      lineCount: bill.items?.length || 0,
      currency: 'USD'
    } })
  }

  return new Response('linked transaction not found', { status: 404 })
}
