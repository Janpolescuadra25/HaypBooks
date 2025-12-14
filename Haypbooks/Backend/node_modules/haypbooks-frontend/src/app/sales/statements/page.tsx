import { mockApi } from '@/lib/mock-api'
import Link from 'next/link'
import { BatchPackSendClient } from '@/components/statements/BatchPackSendClient'

async function fetchSampleCustomers() {
  const res = await mockApi<{ customers: any[] }>('http://localhost/api/customers')
  return res.customers.slice(0,5)
}

export default async function StatementsPage() {
  const customers = await fetchSampleCustomers()
  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-4">
        <h1 className="text-xl font-semibold mb-2">Customer statements</h1>
        <p className="text-sm text-muted-foreground mb-4">View open activity and send statements to customers with outstanding balances.</p>
        <BatchPackSendClient />
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-700/40">
              <th className="px-2 py-1">Customer</th>
              <th className="px-2 py-1">Terms</th>
              <th className="px-2 py-1 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-neutral-800/30 hover:bg-neutral-800/30">
                <td className="px-2 py-1">{c.name}</td>
                <td className="px-2 py-1">{c.terms}</td>
                <td className="px-2 py-1 text-right"><Link className="text-sky-600 hover:underline" href={`/sales/statements/${c.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
