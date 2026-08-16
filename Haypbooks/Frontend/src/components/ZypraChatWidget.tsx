'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, Sparkles, Bolt, Cpu } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompany } from '@/hooks/use-company'

const QUICK_PROMPTS = [
  {
    label: 'Summarize cash flow',
    prompt: 'Please summarize our current cash flow position and call out any risks or opportunities.',
  },
  {
    label: 'Explain balance sheet',
    prompt: 'Explain the key balance sheet items and what they mean for company financial health.',
  },
  {
    label: 'Review recent reports',
    prompt: 'What should I know from the latest financial reports and trends?',
  },
]

type Message = {
  role: 'user' | 'assistant'
  text: string
}

export default function ZypraChatWidget() {
  const { company, loading: companyLoading } = useCompany()
  const companyId = company?.id
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = useMemo(() => !!companyId && !!draft.trim() && !loading, [companyId, draft, loading])

  useEffect(() => {
    if (!companyLoading && companyId && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text: 'Hi! I am Zypra, your accounting assistant. Ask me about reports, cash flow, and company performance.',
        },
      ])
    }
  }, [companyLoading, companyId, messages.length])

  async function sendMessage(prompt: string) {
    if (!companyId) {
      setError('Select a company before using Zypra.')
      return
    }

    const trimmedMessage = prompt.trim()
    if (!trimmedMessage) return

    setError(null)
    setLoading(true)
    setMessages((current) => [...current, { role: 'user', text: trimmedMessage }])

    try {
      const response = await apiClient.post(`/companies/${encodeURIComponent(companyId)}/zypra/chat`, {
        message: trimmedMessage,
      })

      const assistantText = response.data?.reply || 'Zypra did not return a response.'
      setMessages((current) => [...current, { role: 'assistant', text: assistantText }])
      setDraft('')
    } catch (err: any) {
      console.error('Zypra chat error', err)
      setError(
        err?.response?.data?.message || err?.message || 'Unable to send your question. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend) return
    sendMessage(draft)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end">
      {open && (
        <div className="w-[360px] max-h-[540px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-2 text-slate-950">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">Zypra Assistant</div>
                <div className="text-[11px] text-slate-300">Ask about your company’s finances.</div>
              </div>
            </div>
            <button
              type="button"
              className="text-slate-300 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close Zypra chat"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3 text-sm text-slate-700">
            {companyLoading ? (
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">Loading company context…</div>
            ) : !companyId ? (
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">Select a company to start using Zypra.</div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick actions</div>
                  <div className="grid gap-2">
                    {QUICK_PROMPTS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                        onClick={() => sendMessage(item.prompt)}
                      >
                        <div className="flex items-center gap-2">
                          <Bolt size={14} className="text-emerald-500" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-3">
                  <div className="space-y-2">
                    {messages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`rounded-3xl p-3 ${message.role === 'assistant' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-slate-900'}`}>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1">
                          {message.role === 'assistant' ? 'Zypra' : 'You'}
                        </div>
                        <div className="whitespace-pre-wrap break-words text-sm">{message.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              <label htmlFor="zypra-message" className="sr-only">
                Send a message to Zypra
              </label>
              <textarea
                id="zypra-message"
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!companyId || loading}
                placeholder={companyId ? 'Ask Zypra about your company, reports, or cash flow…' : 'Select a company to start chatting.'}
                className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-xs text-slate-500">
                  {error ? <span className="text-rose-600">{error}</span> : 'Powered by Zypra AI'}</div>
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {loading ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-900/20 transition hover:bg-emerald-700"
      >
        <MessageSquare size={18} />
        <span>{open ? 'Hide Zypra' : 'Open Zypra'}</span>
      </button>
    </div>
  )
}
