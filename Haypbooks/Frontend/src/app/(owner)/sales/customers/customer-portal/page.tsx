'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Customer Portal"
      module="SALES"
      breadcrumb="Sales / Customers / Customer Portal"
      purpose="The Customer Portal is a self-service web portal that customers can access to view their outstanding invoices, download invoice PDFs, view payment history, and make online payments. The portal is branded with the company logo and accessible via a unique customer link sent with each invoice. It eliminates the need for customers to contact accounts receivable staff to get invoice copies or check payment status, improving customer experience and reducing collection friction."
      components={[
        { name: 'Portal Configuration Panel', description: 'Enable/disable customer portal, configure branding (logo, colors), and set which features are available to customers.' },
        { name: 'Customer Access List', description: 'List of customers with portal access, their last login, and any pending outstanding invoices visible to them.' },
        { name: 'Portal Preview', description: 'Live preview of what the customer portal looks like to the customer.' },
        { name: 'Payment Gateway Settings', description: 'Configure online payment methods available in the portal (credit card, PayMaya, GCash, PayPal).' },
        { name: 'Notification Settings', description: 'Configure what email notifications are sent to customers (invoice sent, payment received confirmation, statement).' },
      ]}
      tabs={['Configuration', 'Customer Access', 'Portal Preview', 'Payment Settings', 'Notifications']}
      features={[
        'Self-service invoice viewing and download for customers',
        'Online payment capability from the portal',
        'Custom branding with company logo and colors',
        'Configurable payment methods in portal',
        'Customer notification emails from portal',
        'Statement of Account downloadable by customer',
        'Portal access management by customer',
      ]}
      dataDisplayed={[
        'Customers with portal access activated',
        'Last login date per customer',
        'Online payments received from portal',
        'Portal configuration settings',
        'Payment gateway status',
      ]}
      userActions={[
        'Enable customer portal access',
        'Configure portal branding',
        'Grant or revoke portal access per customer',
        'Set up payment gateway in portal',
        'Preview the customer-facing portal',
        'Configure customer email notifications',
      ]}
      relatedPages={[
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
        { label: 'Payment Links', href: '/sales/billing/payment-links' },
      ]}
    />
  )
}

