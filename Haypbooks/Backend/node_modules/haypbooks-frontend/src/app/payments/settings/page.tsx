import Link from 'next/link'
import { getBaseUrl } from '@/lib/server-url'

export const dynamic = 'force-dynamic'

async function getSettings() {
  const res = await fetch(`${getBaseUrl()}/api/payments/settings`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function PaymentsSettingsPage() {
  const data = await getSettings()
  const role = data?.role || 'admin'
  const enabled = data?.enabled ?? false
  const processor = data?.processor || 'Stripe (mock)'
  const methods: string[] = data?.methods || []

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/account-and-settings/company" className="btn-secondary">Back</Link>
        <div className="flex items-center gap-2">
          <a href="/help" className="btn-secondary">Help</a>
          <button className="btn-secondary" onClick={() => location.reload()}>Refresh</button>
        </div>
      </div>

      <h1 className="text-xl font-semibold mb-1">Haypbooks Payments</h1>
      <p className="text-slate-600 mb-4">Configure how you accept customer payments. This is a mock settings page aligned with Roadmap.v2 (Stripe primary, PayPal alternative). RBAC-gated for admins/managers.</p>

      {data?.forbidden && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 p-3 mb-4">
            You don&apos;t have access to manage payments settings. Contact your administrator.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Plan & access</div>
          <div className="mt-1">Role: <b>{role}</b></div>
          <div>Status: <b className={enabled ? 'text-emerald-700' : 'text-slate-700'}>{enabled ? 'Enabled' : 'Disabled'}</b></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Processor</div>
          <div className="mt-1">Primary: <b>{processor}</b></div>
          <div>Supported methods: {methods.length ? methods.join(', ') : '—'}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mt-4">
        <div className="text-sm text-slate-700 mb-2">Actions (mock)</div>
        <div className="flex flex-wrap gap-2">
          <form action={`${getBaseUrl()}/api/payments/settings/toggle`} method="POST">
            <button className="btn-primary" type="submit">{enabled ? 'Disable' : 'Enable'} Payments</button>
          </form>
          <form action={`${getBaseUrl()}/api/payments/settings/connect`} method="POST">
            <button className="btn-secondary" type="submit">Connect {processor}</button>
          </form>
          <form action={`${getBaseUrl()}/api/payments/settings/disconnect`} method="POST">
            <button className="btn-secondary" type="submit">Disconnect</button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mt-4">
        <div className="text-sm text-slate-700 mb-2">Security & compliance</div>
        <ul className="list-disc pl-5 text-slate-600 text-sm">
          <li>PCI DSS: card data is never stored in Haypbooks (mock).</li>
          <li>Tokenization via processor. Webhook events are simulated.</li>
          <li>Audit trail captured in Activity.</li>
        </ul>
      </div>
    </div>
  )
}
