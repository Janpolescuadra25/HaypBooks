import React from 'react'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'

export const metadata = { title: 'Customize invoice layout' }

export default function CustomizeInvoiceLayoutPage() {
  return (
    <div className="container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoice template</h1>
        <a href="/account-and-settings/company#identity" className="link">Company settings</a>
      </div>
      <p className="text-sm text-neutral-500">Select customization to adjust the settings. This template applies to invoices and estimates.</p>
      <InvoiceLayoutPanel />
    </div>
  )
}
