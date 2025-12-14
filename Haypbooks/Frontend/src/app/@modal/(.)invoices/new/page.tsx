'use client'
import NewInvoiceForm from '@/components/NewInvoiceForm'
import ModalErrorBoundary from '@/components/ModalErrorBoundary'

export default function InvoiceModalIntercept() {
  return (
    <ModalErrorBoundary>
      <NewInvoiceForm />
    </ModalErrorBoundary>
  )
}
