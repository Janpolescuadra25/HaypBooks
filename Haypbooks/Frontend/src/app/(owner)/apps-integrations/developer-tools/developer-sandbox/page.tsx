'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2, Copy } from 'lucide-react'
import { integrationService } from '@/services/integration.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const METHOD_BADGE: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-rose-100 text-rose-700',
}

export default function DeveloperSandboxPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showHeaders, setShowHeaders] = useState(true)
  const [showResponseHeaders, setShowResponseHeaders] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, idx) => idx !== index))
  }

  const handleSend = async () => {
    if (!companyId) return
    setLoading(true)
    setFeedback(null)
    const start = Date.now()
    try {
      const payload = {
        method,
        url,
        headers: headers.filter((item) => item.key && item.value),
        body,
      }
      const result = await integrationService.sendSandboxRequest(companyId, payload)
      const duration = Date.now() - start
      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers || {},
        body: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
        duration,
      })
      setFeedback({ type: 'success', message: 'Request completed' })
    } catch (err: any) {
      const duration = Date.now() - start
      setResponse({
        status: err.response?.status ?? 0,
        statusText: err.response?.statusText || 'Error',
        headers: err.response?.headers || {},
        body: err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message || 'Unknown error',
        duration,
      })
      setFeedback({ type: 'error', message: err.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResponse = async () => {
    if (!response?.body) return
    await navigator.clipboard.writeText(response.body)
    setFeedback({ type: 'success', message: 'Response copied' })
  }

  const parsedBody = () => {
    try {
      return JSON.stringify(JSON.parse(response?.body || ''), null, 2)
    } catch {
      return response?.body || ''
    }
  }

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {companyIdError}
        </div>
      </div>
    )
  }

  if (companyIdLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Developer Sandbox</h2>
          <p className="mt-1 text-sm text-slate-500">Test API requests and explore endpoints in a safe environment</p>
        </div>
      </div>

      {feedback && (
        <div className={`rounded-2xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Request</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${METHOD_BADGE[method]}`}>
                {method}
              </span>
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://api.example.com/v1/endpoint"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">Headers</div>
                <button
                  type="button"
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  {showHeaders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showHeaders ? 'Hide' : 'Show'}
                </button>
              </div>
              {showHeaders && (
                <div className="mt-4 space-y-3">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(event) => handleHeaderChange(index, 'key', event.target.value)}
                        placeholder="Header"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(event) => handleHeaderChange(index, 'value', event.target.value)}
                        placeholder="Value"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHeader(index)}
                        className="rounded-lg p-2 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Plus size={16} />
                    Add Header
                  </button>
                </div>
              )}
            </div>
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Request Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={10}
                  placeholder='{ "key": "value" }'
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Response</h3>
          {response ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${response.status >= 500 ? 'bg-rose-100 text-rose-700' : response.status >= 400 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {response.status}
                  </span>
                  <span className="text-sm text-slate-600">{response.statusText}</span>
                </div>
                <span className="text-sm text-slate-500">{response.duration}ms</span>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Response Headers</div>
                  <button
                    type="button"
                    onClick={() => setShowResponseHeaders(!showResponseHeaders)}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  >
                    {showResponseHeaders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showResponseHeaders ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showResponseHeaders && (
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {Object.entries(response.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative rounded-2xl bg-slate-950 p-4">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    onClick={handleCopyResponse}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
                <pre className="max-h-96 overflow-auto text-sm text-white font-mono whitespace-pre-wrap break-words">
                  {parsedBody()}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              Send a request to see the response
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
