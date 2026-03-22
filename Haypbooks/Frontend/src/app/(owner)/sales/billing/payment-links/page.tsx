'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payment Links"
      module="SALES"
      breadcrumb="Sales / Billing / Payment Links"
      purpose="Payment Links generates unique online payment URLs that can be sent to customers for instant invoice settlement. When a customer clicks a payment link, they are taken to a secure branded payment page where they can pay via credit/debit card, GCash, Maya, or bank transfer. Upon successful payment, the invoice is automatically marked as paid, a payment receipt is sent to the customer, and the bank feed records the incoming payment. Payment links can be tied to a specific invoice, a custom amount, or a customer's outstanding balance."
      components={[
        { name: 'Payment Link Generator', description: 'Create a payment link: select invoice (or enter custom amount), choose accepted payment methods, set expiry date.' },
        { name: 'Active Links Dashboard', description: 'All active payment links with creation date, expiry, associated invoice, amount, and payment status (pending/paid/expired).' },
        { name: 'Payment Gateway Configuration', description: 'Connect payment gateway credentials: PayMaya, GCash, PayPal, Stripe, Paynamics, or bank InstaPay.' },
        { name: 'Transaction Log', description: 'All online payments received via payment links with timestamp, amount, payment method, and invoice matched.' },
        { name: 'Receipt Configuration', description: 'Configure automatic receipt email sent to customer upon payment.' },
      ]}
      tabs={['Active Links', 'Create Link', 'Gateway Config', 'Transaction Log']}
      features={[
        'Invoice-specific payment link generation',
        'Multiple payment methods: cards, GCash, Maya, bank transfer',
        'Automatic invoice marking upon successful payment',
        'Automatic receipt email to customer',
        'Payment link expiry setting',
        'Payment notification to AR team',
        'QR code generation for in-person payment collection',
      ]}
      dataDisplayed={[
        'All active payment links with status',
        'Payments received via links in current period',
        'Payment method breakdown (card vs. mobile wallet)',
        'Gateway connection status',
        'Transaction log with amounts and timestamps',
      ]}
      userActions={[
        'Generate a payment link for an invoice',
        'Send payment link to customer',
        'Configure payment gateway credentials',
        'View payment transactions received',
        'Export payment transaction log',
        'Disable or revoke an active payment link',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Customer Portal', href: '/sales/customers/customer-portal' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
      ]}
    />
  )
}

