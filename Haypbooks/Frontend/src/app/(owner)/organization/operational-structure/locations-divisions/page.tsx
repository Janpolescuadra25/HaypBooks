'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Locations & Divisions"
      module="ORGANIZATION"
      breadcrumb="Organization / Operational Structure / Locations & Divisions"
      purpose="Locations & Divisions manages the physical office locations and operational business divisions used as transaction tracking dimensions. These are used as filters and groupings in reporting, allowing businesses to see financial performance by location (e.g., Manila vs. Cebu branch) or by business division (e.g., Retail vs. Wholesale vs. Online). Each location can have its own tax registrations, bank accounts, and reporting settings."
      components={[
        { name: 'Location List', description: 'All registered locations with address, location code, type (office/warehouse/branch), and status.' },
        { name: 'Division List', description: 'Business divisions with division name, code, parent division, and assigned accounts.' },
        { name: 'Location Detail', description: 'Full location profile: address, contacts, regional tax registrations, assigned users, and bank accounts.' },
        { name: 'Add Location/Division Form', description: 'Create new locations or divisions with all required fields and default account assignments.' },
      ]}
      tabs={['Locations', 'Divisions', 'Hierarchy', 'Tax Registrations']}
      features={[
        'Multi-location business structure support',
        'Location-based financial reporting dimension',
        'Regional tax registration per location',
        'Assign default accounts per location',
        'Location-level access control for users',
        'Hierarchical division structure',
      ]}
      dataDisplayed={[
        'All locations with address and type',
        'Division hierarchy and codes',
        'Tax registration numbers per location',
        'Assigned employees per location',
        'Active/inactive status',
      ]}
      userActions={[
        'Add a new location or division',
        'Edit location address and contact details',
        'Register tax IDs for a location',
        'Assign users to a location',
        'Deactivate an unused location',
        'Set default GL accounts per location',
      ]}
      relatedPages={[
        { label: 'Departments', href: '/organization/operational-structure/departments' },
        { label: 'Legal Entities', href: '/organization/entity-structure/legal-entities' },
        { label: 'Org Chart', href: '/organization/operational-structure/org-chart' },
      ]}
    />
  )
}

