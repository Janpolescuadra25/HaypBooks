"use client"

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

export default function DevelopersApiExplorerPage() {
  const containerCls = 'mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8'
  const barWrapperCls = 'w-full px-2 sm:px-4 lg:px-6'
  const specUrl = '/openapi/apps.mock.json'
  const tryAllowedByEnv = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

  // Fixed theme for now; remove Light/Dark toggle per request
  const theme = 'light' as const
  const [allowTry, setAllowTry] = useState<boolean>(tryAllowedByEnv)
  const [viewer, setViewer] = useState<'redoc' | 'rapidoc'>('redoc')
  const docRef = useRef<any>(null)
  const redocMountRef = useRef<HTMLDivElement | null>(null)

  // Apply attributes to the RapiDoc element when toggles change
  useEffect(() => {
    const el = docRef.current as HTMLElement | null
    if (!el) return
    el.setAttribute('theme', theme)
    el.setAttribute('allow-try', allowTry ? 'true' : 'false')
    el.setAttribute('render-style', 'read')
    el.setAttribute('show-header', 'false')
    el.setAttribute('spec-url', specUrl)
  }, [theme, allowTry, specUrl])

  // Initialize Redoc when selected
  useEffect(() => {
    if (viewer !== 'redoc') return
    const mount = redocMountRef.current
    const RedocAny: any = (globalThis as any).Redoc
    if (!mount || !RedocAny || !RedocAny.init) return
    mount.innerHTML = ''
    RedocAny.init(specUrl, {
      scrollYOffset: 0,
      hideDownloadButton: false,
      expandResponses: '200,201',
      theme: {
        colors: { primary: { main: '#0d9488' } },
        typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' },
        menu: { width: '300px' },
        logo: { gutter: '8px' },
      },
    }, mount)
  }, [viewer, specUrl])

  const copyCurl = async () => {
    const text = `curl -s http://localhost:3000/api/apps/connectors | jq .`
    try {
      await navigator.clipboard.writeText(text)
      // No toast framework here; rely on quiet success
    } catch {
      // ignore
    }
  }

  return (
    <div className="pb-10">
  {/* Load viewers */}
  <Script src="https://unpkg.com/rapidoc/dist/rapidoc-min.js" strategy="afterInteractive" />
  <Script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js" strategy="afterInteractive" />

      {/* Mega bar header */}
      <section className={`mb-4 ${barWrapperCls}`}>
        <div className="w-full rounded-[28px] border border-teal-200 bg-white shadow-lg shadow-teal-200/60">
          <div className={`${containerCls} py-4`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">API Explorer</h1>
                <p className="text-sm text-slate-600">Browse the mock App Transactions API powered by a local OpenAPI spec.</p>
                <p className="text-xs text-slate-500">Spec: <code>{specUrl}</code></p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-full border">
              <button
                className={`px-3 py-1 text-xs ${viewer === 'redoc' ? 'bg-white text-slate-900' : 'bg-transparent text-slate-600'}`}
                onClick={() => setViewer('redoc')}
                aria-pressed={viewer === 'redoc' ? 'true' : 'false'}
                title="Use Redoc viewer"
              >
                Redoc
              </button>
              <button
                className={`px-3 py-1 text-xs ${viewer === 'rapidoc' ? 'bg-white text-slate-900' : 'bg-transparent text-slate-600'}`}
                onClick={() => setViewer('rapidoc')}
                aria-pressed={viewer === 'rapidoc' ? 'true' : 'false'}
                title="Use RapiDoc viewer"
              >
                RapiDoc
              </button>
            </div>
            {tryAllowedByEnv ? (
              <button
                className={`rounded-full border px-3 py-1 text-xs ${allowTry ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'}`}
                onClick={() => setAllowTry((v) => !v)}
                title="Toggle Try-It (mock mode)"
              >
                {allowTry ? 'Try‑It: ON' : 'Try‑It: OFF'}
              </button>
            ) : (
              <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-600" title="Enable NEXT_PUBLIC_USE_MOCK_API=true to turn on Try‑It">
                Try‑It locked
              </span>
            )}
            <a href={specUrl} download className="rounded-full border px-3 py-1 text-xs text-slate-700 hover:bg-slate-50">Download OpenAPI</a>
            <button onClick={copyCurl} className="rounded-full border px-3 py-1 text-xs text-slate-700 hover:bg-slate-50">Copy sample cURL</button>
            <a href="/developers" className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-900">Back</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explorer */}
  <main className={`${containerCls} scroll-smooth`}>
        <div className="glass-card overflow-hidden rounded-lg border">
          <div className="h-[80vh] w-full sm:h-[82vh]">
            {viewer === 'rapidoc' ? (
              // @ts-ignore
              <rapi-doc ref={docRef as any} />
            ) : (
              <div ref={redocMountRef} className="h-full w-full overflow-auto" />
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Tip: Set <code>document.cookie = &#39;role=viewer&#39;</code> (read) or <code>&#39;role=admin&#39;</code> (read/write) in the browser console to test RBAC behavior.</p>
        {!tryAllowedByEnv && (
          <p className="mt-1 text-xs text-slate-500">Note: Try‑It is disabled. To enable mock Try‑It locally, set <code>NEXT_PUBLIC_USE_MOCK_API=true</code> and reload.</p>
        )}
      </main>
    </div>
  )
}
