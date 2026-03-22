'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Sales Orders'
      module='SALES'
      breadcrumb='Sales / Sales Operations / Sales Orders'
      purpose='Manages sales orders from creation through fulfillment and invoicing. Tracks order status, links to inventory for fulfillment, manages partial shipments, and enables invoice generation from completed or partially fulfilled orders.'
      components={[
        { name: 'Sales Order List', description: 'All sales orders with status, customer, amount, and fulfillment progress' },
        { name: 'Order Entry Form', description: 'Detailed order creation with items, quantities, shipping details, and pricing' },
        { name: 'Fulfillment Tracker', description: 'Monitors order picking, packing, and shipping status per order line' },
        { name: 'Partial Shipment Manager', description: 'Handles split fulfillment with multiple shipment events and invoices' },
        { name: 'Order-to-Invoice Converter', description: 'Generate invoice from fully or partially fulfilled sales order' },
        { name: 'Backorder Management', description: 'Flags and tracks backordered items with estimated availability dates' },
      ]}
      tabs={['All Orders', 'Pending Fulfillment', 'Partially Fulfilled', 'Fulfilled', 'Invoiced']}
      features={['Full order lifecycle management', 'Partial fulfillment and backorder handling', 'Order-to-invoice conversion', 'Inventory integration for order fulfillment', 'Shipping carrier integration', 'Order amendment and cancellation', 'Export order history']}
      dataDisplayed={['Order number and customer', 'Order date and requested delivery date', 'Line items, quantities, and prices', 'Total order value', 'Fulfillment status per line', 'Shipped and remaining quantity', 'Invoice generated (yes/no)']}
      userActions={['Create new sales order', 'Add items to order', 'Confirm order fulfillment', 'Record partial shipment', 'Handle backorder', 'Generate invoice from order', 'Cancel or amend sales order']}
      relatedPages={[
        { label: 'Quotes & Estimates', href: '/sales/sales-operations/quotes-estimates' },
        { label: 'Products & Services', href: '/sales/sales-operations/products-services' },
        { label: 'Revenue Recognition', href: '/sales/revenue-management/revenue-recognition' },
      ]}
    />
  )
}

