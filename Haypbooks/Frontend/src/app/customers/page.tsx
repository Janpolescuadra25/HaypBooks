import Link from 'next/link'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import CustomersListCard from '@/components/CustomersListCard'
import Notice from '@/components/Notice'
import CustomerHubNav from '@/components/CustomerHubNav'

async function loadCustomers() {
  const res = await fetch(`${getBaseUrl()}/api/customers`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load customers')
  return res.json()
}

export default async function CustomersPage() {
  const data = await loadCustomers()
  const customers = data.customers as Array<{ id: string; name: string; terms?: string; email?: string; phone?: string }>
  const role = getRoleFromCookies()
  const canCreate = hasPermission(role, 'customers:write')
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <CustomerHubNav activeHref="/customers" />
      </div>
      <Notice />
  <CustomersListCard customers={customers} canCreate={canCreate} />
    </div>
  )
}
