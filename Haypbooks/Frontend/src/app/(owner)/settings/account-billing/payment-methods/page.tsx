'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PaymentMethodsPage() {
  return (
    <PageDocumentation
      title="Payment Methods"
      module="SETTINGS"
      breadcrumb="Settings / Account & Billing / Payment Methods"
      purpose="Payment Methods allows account administrators to add, update, or remove the payment instruments used for Haypbooks subscription billing. This page supports credit cards, debit cards, and bank transfer details, ensuring billing continuity. Admins can set a primary payment method and add backups to prevent service interruptions."
      components={[
        { name: 'Saved Payment Cards', description: 'Grid of stored payment methods showing card type, masked number, expiry, and primary/backup designation.' },
        { name: 'Add Payment Method Form', description: 'Secure tokenized form to add a new credit/debit card or bank account via payment gateway.' },
        { name: 'Primary Method Selector', description: 'Radio selector to designate one method as the default for automatic subscription renewal charges.' },
        { name: 'Remove Confirmation Dialog', description: 'Safety dialog requiring confirmation before deleting a stored payment method.' },
        { name: 'Billing Address Section', description: 'Form fields for billing address associated with the primary payment method.' },
      ]}
      tabs={['Saved Methods', 'Add New', 'Billing Address']}
      features={[
        'Add multiple credit/debit cards as primary or backup payment methods',
        'PCI-compliant tokenized card storage — no raw card data stored on servers',
        'Set primary billing method for automatic subscription renewals',
        'Update expiry dates and billing address without re-entering card number',
        'Remove payment methods with confirmation guard against accidental deletion',
      ]}
      dataDisplayed={[
        'Card brand (Visa, Mastercard, etc.) and masked last 4 digits',
        'Expiry date and cardholder name',
        'Primary vs. backup method designation',
        'Billing address linked to each card',
        'Date each card was added',
      ]}
      userActions={[
        'Add a new credit or debit card',
        'Set a card as the primary billing method',
        'Update billing address for an existing card',
        'Remove a saved payment method',
        'View card status (active, expired, failed)',
      ]}
    />
  )
}

