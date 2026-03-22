'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Products & Services'
      module='SALES'
      breadcrumb='Sales / Sales Operations / Products & Services'
      purpose='Maintains the catalog of products and services sold by the business, including pricing, units of measure, tax categories, and GL account mappings. Serves as the master data source for all sales transactions, quotes, and invoicing.'
      components={[
        { name: 'Product/Service Catalog', description: 'Searchable list of all active and inactive products and services with key attributes' },
        { name: 'Item Detail Form', description: 'Comprehensive data entry for name, description, type, price, UOM, tax, and accounts' },
        { name: 'Pricing Tier Linker', description: 'Associates items with specific price lists for customer-tier pricing' },
        { name: 'GL Account Mapper', description: 'Maps each item to income, COGS, and inventory GL accounts' },
        { name: 'Item Category Manager', description: 'Organizes items into hierarchical categories for reporting and filtering' },
        { name: 'Bundle Builder', description: 'Creates product bundles with component items and bundle pricing' },
      ]}
      tabs={['Products', 'Services', 'Bundles', 'Categories', 'Inactive']}
      features={['Comprehensive product and service catalog', 'Pricing tier and price list integration', 'GL account mapping per item', 'Item category hierarchies', 'Product bundle creation', 'Import from Excel for bulk catalog setup', 'Item usage reporting']}
      dataDisplayed={['Item name, code, and description', 'Item type (product, service, bundle)', 'Default sale price and currency', 'Unit of measure', 'Tax category', 'Income and COGS GL accounts', 'Item category']}
      userActions={['Add new product or service', 'Edit item pricing and description', 'Map GL accounts to items', 'Assign items to categories', 'Create item bundle', 'Deactivate retired items', 'Import product catalog from Excel']}
      relatedPages={[
        { label: 'Price Lists', href: '/sales/customers/price-lists' },
        { label: 'Sales Orders', href: '/sales/sales-operations/sales-orders' },
        { label: 'Quotes & Estimates', href: '/sales/sales-operations/quotes-estimates' },
      ]}
    />
  )
}

