"use client"

import { useEffect, useState } from 'react'

// Redesigned developer portal: clear sections, anchor navigation with active pill, and scroll-safe API Explorer
export default function DevelopersPortalPage() {
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'mock-api', label: 'Mock API' },
    { id: 'security', label: 'Security' },
    { id: 'policies', label: 'Policies' },
    { id: 'resources', label: 'Resources' },
  ]

  const [active, setActive] = useState<string>('overview')
  // Responsive container: expands with viewport like other pages; keeps safe side padding
  const containerCls = 'mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8'
  // Slightly wider container just for the section bar to achieve the “fuller” look left/right
  // Full-bleed bar: no max-width, just responsive side padding
  const navContainerCls = 'w-full px-2 sm:px-4 lg:px-6'

  useEffect(() => {
    // Scroll spy to highlight current section like a pill bar
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.25 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Segment class builder: render as one big bar with equal-width segments
  const pillClass = (id: string, first = false, last = false) => {
    const base = 'block w-full text-center px-3 py-2 sm:px-4 text-[14px] font-medium focus:outline-none border-t-2 border-transparent';
    const rounding = `${first ? 'rounded-l-[28px]' : 'rounded-none'} ${last ? 'rounded-r-[28px]' : 'rounded-none'}`;
    if (id === active) return `${base} ${rounding} bg-hb-primary text-white shadow-sm border-hb-primary`;
    return `${base} ${rounding} text-slate-700 hover:bg-slate-50`;
  }

  return (
    <div id="top" className="min-h-screen">
      {/* Mega bar: hero + section tabs in one bar */}
      <section aria-label="Developer intro and sections" className={`mb-4 ${navContainerCls}`}>
        <div className="w-full rounded-[28px] border border-teal-200 bg-white shadow-lg shadow-teal-200/60">
          <div className={`${containerCls} py-4 sm:py-5`}>
            <h1 className="text-2xl font-semibold tracking-tight">HaypDeveloper</h1>
            <p className="mt-1 text-sm text-slate-600">
              Build connectors and apps for HaypBooks with a JSON‑first, incremental sync model. Works with any third‑party platform.
            </p>
            <p className="text-xs text-slate-500">Local: open <code>/developers</code>. For mock calls, set <code>NEXT_PUBLIC_USE_MOCK_API=true</code>. Use the section bar below to navigate.</p>
            <div className="mt-3">
              <a href="/developers/explorer" className="inline-flex items-center rounded-full btn-hb-primary px-4 py-2 text-sm font-semibold shadow">
                Open API Explorer
              </a>
            </div>
          </div>
          <div className={`${containerCls} pb-2 sm:pb-3`}>
            <ul className="no-scrollbar flex flex-nowrap justify-between divide-x divide-teal-200 overflow-x-auto px-2 py-1 md:overflow-visible">
              {sections.map((s, i) => (
                <li key={s.id} className="basis-40 flex-1 shrink-0">
                  <a
                    className={pillClass(s.id, i === 0, i === sections.length - 1)}
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'page' : undefined}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Overview inside the mega bar */}
          <div className={`${containerCls} pb-6`}>
            <section id="overview" className="scroll-mt-20">
              <h2 className="text-lg font-medium">Overview</h2>
              <p className="mt-2 text-sm text-slate-600">
                The portal bundles docs, examples, and a live explorer. Keep integrations brand‑neutral, JSON‑first, and auditable. Posting actions are role‑gated and respect closed‑period protections.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded border bg-slate-50 p-4">
                  <h3 className="font-medium">Use the mock backend</h3>
                  <p className="mt-1 text-sm text-slate-600">Same‑origin APIs for offline demos; perfect for Try‑it flows.</p>
                </div>
                <div className="rounded border bg-slate-50 p-4">
                  <h3 className="font-medium">Secure by default</h3>
                  <p className="mt-1 text-sm text-slate-600">RBAC and closed‑period guards; least‑privilege scopes.</p>
                </div>
              </div>
            </section>
            {/* Quickstart inside the mega bar */}
            <section id="quickstart" className="mt-6 scroll-mt-20">
              <h2 className="text-lg font-medium">Quickstart</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                <li>Choose scopes for your app (orders, fees, payouts, items, customers).</li>
                <li>Use OAuth 2.0 or API key. Each connection binds to a single company.</li>
                <li>Sync incrementally and idempotently; persist raw JSON payloads.</li>
                <li>Normalize to candidate journals; never mutate the ledger directly.</li>
                <li>Support mapping catalogs (items, categories, taxes, counterparties).</li>
                <li>Users review and Post/Ignore; all actions emit audit events.</li>
              </ol>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">Try a request (curl)</summary>
                <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 text-xs">{`# Ensure mock is enabled in the browser: NEXT_PUBLIC_USE_MOCK_API=true
curl -s http://localhost:3000/api/apps/connectors | jq .`}</pre>
              </details>
            </section>
            {/* Mock API inside the mega bar */}
            <section id="mock-api" className="mt-6 scroll-mt-20">
              <h2 className="text-lg font-medium">Mock API</h2>
              <ul className="mt-2 space-y-1 text-sm">
                <li><code>GET /api/apps/connectors</code> — list connectors (status, lastSyncAt). Requires <code>reports:read</code>.</li>
                <li><code>POST /api/apps/connectors/:id/sync</code> — trigger a sync run. Requires <code>journal:write</code>.</li>
                <li><code>GET /api/apps/postings</code> — staged postings (JSON‑first). Requires <code>reports:read</code>.</li>
                <li><code>GET /api/apps/postings/:id/preview</code> — derived DR/CR lines; normalized date.</li>
                <li><code>POST /api/apps/postings/:id/post</code> — post journal with closed‑period guard.</li>
                <li><code>POST /api/apps/postings/:id/ignore</code> — ignore with audit log.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">These endpoints power the App transactions UI and are safe to explore locally.</p>
            </section>
            {/* Security inside the mega bar */}
            <section id="security" className="mt-6 scroll-mt-20">
              <h2 className="text-lg font-medium">Security</h2>
              <ul className="mt-2 space-y-1 text-sm">
                <li>RBAC: reads require <code>reports:read</code>; writes require <code>journal:write</code>.</li>
                <li>Closed‑period: posting validates dates and blocks closed periods.</li>
                <li>Secrets: encrypt at rest; rotate; minimize scopes.</li>
                <li>Rate limits and retries with backoff; resume from checkpoints.</li>
              </ul>
            </section>
            {/* Policies inside the mega bar */}
            <section id="policies" className="mt-6 scroll-mt-20">
              <h2 className="text-lg font-medium">Policies</h2>
              <ul className="mt-2 space-y-1 text-sm">
                <li>JSON‑first: CSV derives from JSON detail; include CSV‑Version prelude.</li>
                <li>Filenames: use tokens like <code>{`{company}_{source}_{yyyymmdd}_{csvVersion}`}</code>.</li>
                <li>Errors: standardized JSON shape with code, message, details, docUrl.</li>
                <li>Versioning: date‑based or v1/v2 with deprecation windows.</li>
              </ul>
            </section>
            {/* Resources inside the mega bar */}
            <section id="resources" className="mt-6 scroll-mt-20">
              <h2 className="text-lg font-medium">Resources</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>App Transactions — Transactions → App transactions (in product).</li>
                <li>Developer guide — <code>New.documentation/All.about.Haypdeveloper.md</code></li>
                <li>Completion dashboard — <code>New.documentation/Completion summary/Visual.completion/Visual.html</code></li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      {/* Content + right rail */}
      <main className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${containerCls}`}>
        {/* Main content */}
        <div className="space-y-6">
          {/* All sections moved into mega bar */}

          {/* Quickstart removed from main */}

          {/* Mock API removed from main */}

          {/* Security, Policies, Resources removed from main */}
        </div>
      </main>
    </div>
  )
}
