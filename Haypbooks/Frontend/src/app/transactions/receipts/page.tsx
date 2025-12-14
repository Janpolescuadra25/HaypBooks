"use client"
import { useEffect, useRef, useState, Suspense, Fragment } from 'react'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'

type Receipt = {
  id: string
  date: string
  vendor: string
  amount: number
  method?: 'upload' | 'email' | 'manual' | 'capture'
  status?: 'uploaded' | 'parsed' | 'matched' | 'posted'
  matchedTransactionId?: string
  attachment?: { name: string; size: number }
  postedJournalId?: string
  expenseId?: string
  expenseAccountNumber?: string
  ocrExtract?: { vendor?: string; date?: string; amount?: number }
  suggestedMatchTransactionId?: string
}

export default function ReceiptsPage() {
  const [rows, setRows] = useState<Receipt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Array<{ id: string; number: string; name: string; type: string }>>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('6000')
  const fileRef = useRef<HTMLInputElement>(null)
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
  // Camera modal state
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [cameraPhase, setCameraPhase] = useState<'idle'|'captured'|'scanning'|'scanned'|'error'>('idle')
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVendor, setEditVendor] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editAmount, setEditAmount] = useState('')
  // Suggestions & match modal state
  const [suggestionsModalId, setSuggestionsModalId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Array<{ kind: string; id: string; number?: string; name: string; remaining: number; amountDifference: number; dateDifferenceDays: number; vendorSimilarity?: number; score?: number }>>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const [suggestionsNegative, setSuggestionsNegative] = useState(false)
  const [scoreThreshold, setScoreThreshold] = useState<number>(0) // 0-1 min score filter
  // Linked match preview modal state
  const [linkedPreviewId, setLinkedPreviewId] = useState<string | null>(null)
  const [linkedPreview, setLinkedPreview] = useState<any>(null)
  const [linkedLoading, setLinkedLoading] = useState(false)
  const [linkedError, setLinkedError] = useState<string | null>(null)

  async function openLinked(id: string) {
    setLinkedPreviewId(id)
    setLinkedPreview(null)
    setLinkedError(null)
    setLinkedLoading(true)
    try {
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/linked`, { cache: 'no-store' })
      if (!res.ok) throw new Error(await res.text().catch(()=> 'Failed to load'))
      const json = await res.json().catch(()=>({}))
      setLinkedPreview(json.linked || null)
    } catch (e: any) {
      setLinkedError(e.message)
    } finally { setLinkedLoading(false) }
  }
  function closeLinked() {
    setLinkedPreviewId(null)
    setLinkedPreview(null)
    setLinkedError(null)
    setLinkedLoading(false)
  }

  async function openSuggestions(rid: string) {
    setSuggestionsModalId(rid)
    setSuggestions([])
    setSuggestionsError(null)
    setSuggestionsLoading(true)
    setScoreThreshold(0) // reset threshold each open
    try {
      // Determine if this receipt is a negative amount to show bill-only helper
      const r = rows.find(x => x.id === rid)
      setSuggestionsNegative(!!r && Number(r.amount || 0) < 0)
    } catch { setSuggestionsNegative(false) }
    try {
      const res = await fetch(`/api/receipts/${encodeURIComponent(rid)}/suggestions?limit=6`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load suggestions')
      const json = await res.json().catch(()=>({ suggestions: [] }))
      setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : [])
    } catch (e: any) {
      setSuggestionsError(e.message)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  function closeSuggestions() {
    setSuggestionsModalId(null)
    setSuggestions([])
    setSuggestionsError(null)
    setSuggestionsLoading(false)
  }

  async function applySuggestion(receiptId: string, txnId: string) {
    try {
      const res = await fetch(`/api/receipts/${encodeURIComponent(receiptId)}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: txnId }) })
      if (!res.ok) throw new Error('Match failed')
      await load()
      setNotice('Suggestion applied. Receipt marked as Matched.')
      closeSuggestions()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function manualMatch(receiptId: string) {
    const txnId = prompt('Enter transaction id to match:')
    if (!txnId) return
    await applySuggestion(receiptId, txnId)
  }

  async function load() {
    try {
      const res = await fetch('/api/receipts', { cache: 'no-store' })
      const json = res.ok ? await res.json() : { receipts: [] }
      setRows(Array.isArray(json.receipts) ? json.receipts : [])
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function handleUpload(files: FileList | null, method: 'capture' | 'upload') {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const f = files[0]
      // Leave amount as 0; deterministic OCR will populate during parse
      const body = { date: new Date().toISOString().slice(0,10), vendor: f.name.replace(/\.[^.]+$/, ''), amount: 0, attachment: { name: f.name, size: f.size }, method }
      const res = await fetch('/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        if (res.status === 409) {
          const j = await res.json().catch(()=>({}))
          throw new Error(`Duplicate upload blocked${j?.duplicateOf ? ` (already exists: ${j.duplicateOf})` : ''}`)
        }
        throw new Error('Upload failed')
      }
      const created = await res.json().catch(() => null)
      const createdId = created?.receipt?.id as string | undefined
      // Auto-parse to streamline flow for both capture and upload
      if (createdId) {
        try {
          const pr = await fetch(`/api/receipts/${encodeURIComponent(createdId)}/parse`, { method: 'POST' })
          if (!pr.ok) {
            // Non-blocking; still refresh list
          }
        } catch {}
      }
      await load()
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) {
      setError(e.message)
    } finally { setUploading(false) }
  }

  async function handleUploadSingle(file: File, method: 'capture' | 'upload') {
    // Wrapper to support camera capture blob
    setUploading(true)
    try {
      const body = { date: new Date().toISOString().slice(0,10), vendor: file.name.replace(/\.[^.]+$/, ''), amount: 0, attachment: { name: file.name, size: file.size }, method }
      const res = await fetch('/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        if (res.status === 409) {
          const j = await res.json().catch(()=>({}))
          throw new Error(`Duplicate upload blocked${j?.duplicateOf ? ` (already exists: ${j.duplicateOf})` : ''}`)
        }
        throw new Error('Upload failed')
      }
      const created = await res.json().catch(() => null)
      const createdId = created?.receipt?.id as string | undefined
      if (createdId) {
        try { await fetch(`/api/receipts/${encodeURIComponent(createdId)}/parse`, { method: 'POST' }) } catch {}
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  // Camera controls
  async function openCamera() {
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      setCameraStream(stream)
      setCameraOpen(true)
      // Attach to video element
      requestAnimationFrame(() => {
        const vid = videoRef.current
        if (vid) {
          ;(vid as any).srcObject = stream
          vid.play().catch(() => { /* ignore */ })
        }
      })
    } catch (e: any) {
      setCameraError(e?.message || 'Unable to access camera')
      setCameraOpen(true)
    }
  }

  function stopCamera() {
    try { cameraStream?.getTracks().forEach(t => t.stop()) } catch {}
    setCameraStream(null)
  }

  function closeCamera() {
    stopCamera()
    setCapturedUrl(null)
    setCapturedBlob(null)
    setCameraOpen(false)
    setCameraError(null)
    setCameraPhase('idle')
  }

  function takePhoto() {
    const vid = videoRef.current
    const canvas = canvasRef.current
    if (!vid || !canvas) return
    const w = vid.videoWidth || 1280
    const h = vid.videoHeight || 720
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(vid, 0, 0, w, h)
    canvas.toBlob((blob) => {
      if (!blob) return
      if (capturedUrl) URL.revokeObjectURL(capturedUrl)
      const url = URL.createObjectURL(blob)
      setCapturedUrl(url)
      setCapturedBlob(blob)
      setCameraPhase('captured')
    }, 'image/jpeg', 0.92)
  }

  function retakePhoto() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    setCapturedUrl(null)
    setCapturedBlob(null)
    setCameraPhase('idle')
  }

  async function usePhoto() {
    if (!capturedBlob) return
    const file = new File([capturedBlob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' })
    // Inline upload + parse so we can show in-modal progress/confirmation
    try {
      setCameraPhase('scanning')
      const body = { date: new Date().toISOString().slice(0,10), vendor: file.name.replace(/\.[^.]+$/, ''), amount: 0, attachment: { name: file.name, size: file.size }, method: 'capture' as const }
      const res = await fetch('/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        if (res.status === 409) {
          setCameraPhase('error')
          return
        }
        throw new Error('Upload failed')
      }
      const created = await res.json().catch(() => null)
      const createdId = created?.receipt?.id as string | undefined
      if (createdId) {
        const pr = await fetch(`/api/receipts/${encodeURIComponent(createdId)}/parse`, { method: 'POST' })
        if (!pr.ok) throw new Error('Scan failed')
      }
      await load()
      setCameraPhase('scanned')
    } catch (e) {
      setCameraPhase('error')
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/receipts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Delete failed')
        throw new Error(msg || 'Delete failed')
      }
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (e: any) { setError(e.message) }
  }

  async function parse(id: string) {
    try {
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/parse`, { method: 'POST' })
      if (!res.ok) throw new Error('Parse failed')
      await load()
    } catch (e: any) { setError(e.message) }
  }

  async function match(id: string) {
    try {
      const txnId = prompt('Enter transaction id to match:')
      if (!txnId) return
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: txnId }) })
      if (!res.ok) throw new Error('Match failed')
      await load()
    } catch (e: any) { setError(e.message) }
  }

  async function post(id: string) {
    try {
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/post`, { method: 'POST' })
      if (!res.ok) throw new Error('Post failed')
      await load()
      setNotice('Receipt posted. Next: Convert to Expense or review journal link.')
    } catch (e: any) { setError(e.message) }
  }

  async function openConvertPicker(id: string) {
    setConvertingId(id)
    setSelectedAccount('6000')
    // lazy-load accounts (expense type only)
    try {
      if (accounts.length === 0) {
        const res = await fetch('/api/accounts')
        const json = await res.json().catch(() => ({ accounts: [] }))
        const list = Array.isArray(json.accounts) ? json.accounts : []
        const expense = list.filter((a: any) => String(a.type) === 'Expense')
        setAccounts(expense)
      }
    } catch { /* non-blocking */ }
  }

  function nextStepHint(r: Receipt) {
    if (!r.status || r.status === 'uploaded') return 'Next: Scan'
    if (r.status === 'parsed') return 'Next: Match'
    if (r.status === 'matched') return 'Next: Post'
    if (r.status === 'posted' && !r.expenseId) return 'Next: Convert to Expense'
    return null
  }

  function beginEdit(r: Receipt) {
    setEditingId(r.id)
    setEditVendor(r.vendor || '')
    setEditDate(r.date || '')
    setEditAmount(String(Number(r.amount || 0)))
  }

  async function saveEdit(id: string) {
    try {
      const amt = Number(editAmount)
      const payload = { vendor: editVendor, date: editDate, amount: amt }
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/update`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(()=> 'Update failed')
        throw new Error(text || 'Update failed')
      }
      setEditingId(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function confirmConvert() {
    if (!convertingId) return
    try {
      const body = { expenseAccountNumber: selectedAccount || '6000' }
      const res = await fetch(`/api/receipts/${encodeURIComponent(convertingId)}/expense`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Convert failed')
      setConvertingId(null)
      await load()
      setNotice('Receipt converted to Expense successfully.')
    } catch (e: any) { setError(e.message) }
  }

  function cancelConvert() {
    setConvertingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden overflow-x-auto !p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap" role="toolbar" aria-label="Receipts toolbar">
          <div className="min-w-0 grow">
            <h1 className="text-xl font-semibold text-slate-900">Receipts</h1>
            <p className="text-slate-600 text-sm">Capture, attach, and link receipts to expenses.</p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Unified toolbar actions (right side of the big bar) */}
            <Suspense fallback={null}><ExportCsvButton exportPath="/api/receipts/export" /></Suspense>
            <PrintButton />
            {/* Snap: open live camera (desktop and mobile). Falls back to error message if not supported. */}
            <button className={`btn-secondary ${uploading ? 'opacity-70 pointer-events-none' : ''}`} onClick={openCamera} aria-label="Snap receipt photo">Snap</button>
            <label className={`btn-primary ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleUpload(e.target.files, 'upload')} aria-label="Upload receipt" />
              Upload
            </label>
          </div>
        </div>
      </div>

      {error && (<div className="glass-card text-red-700">{error}</div>)}
      {notice && (
        <div className="glass-card bg-emerald-50 text-emerald-800 flex items-center justify-between">
          <div>{notice}</div>
          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-left">Attachment</th>
                <th className="px-3 py-2 text-left">Journal</th>
              <th className="px-3 py-2 text-left">Expense</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {rows.length === 0 ? (
              <tr className="border-t border-slate-200"><td className="px-3 py-3" colSpan={9}>No receipts yet.</td></tr>
            ) : rows.map(r => (
              <Fragment key={r.id}>
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    {editingId === r.id ? (
                      <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="input input-sm border rounded px-2 py-1" aria-label="Date" />
                    ) : (
                      formatMMDDYYYY(r.date)
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === r.id ? (
                      <input value={editVendor} onChange={e=>setEditVendor(e.target.value)} className="input input-sm border rounded px-2 py-1 w-[14ch]" aria-label="Vendor" />
                    ) : (
                      r.vendor
                    )}
                    {/* Detected vendor label */}
                    {r.ocrExtract?.vendor && r.ocrExtract.vendor !== r.vendor && (
                      <span className="ml-2 text-[11px] rounded bg-amber-100 text-amber-800 px-1 py-0.5">Detected: {r.ocrExtract.vendor}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {editingId === r.id ? (
                      <input value={editAmount} onChange={e=>setEditAmount(e.target.value)} className="input input-sm border rounded px-2 py-1 w-[10ch] text-right" aria-label="Amount" />
                    ) : (
                      <Amount value={Number(r.amount || 0)} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {/* Status badge with friendly label */}
                    {(() => {
                      const status = r.status || 'uploaded'
                      const label = status === 'parsed' ? 'Scanned' : (status.charAt(0).toUpperCase() + status.slice(1))
                      const cls = status === 'posted'
                        ? 'bg-green-100 text-green-800'
                        : status === 'matched'
                          ? 'bg-sky-100 text-sky-800'
                          : status === 'parsed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                    })()}
                  </td>
                  <td className="px-3 py-2">{r.method || 'upload'}</td>
                  <td className="px-3 py-2">{r.attachment?.name || '-'}</td>
                    <td className="px-3 py-2">{r.postedJournalId ? (<a href={`/journal/${r.postedJournalId}`} className="text-sky-600">{r.postedJournalId}</a>) : '-'}</td>
                  <td className="px-3 py-2">{r.expenseId ? (<span className="text-sky-700">{r.expenseId}</span>) : '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                        {/* Next-step hint */}
                        {nextStepHint(r) && (
                          <span className="text-[11px] text-slate-500 mr-1">{nextStepHint(r)}</span>
                        )}
                        {/* Inline edit controls (only before post) */}
                        {(!r.status || r.status === 'uploaded' || r.status === 'parsed') && (
                          editingId === r.id ? (
                            <>
                              <button className="btn-primary !px-2 !py-1 text-xs" onClick={() => saveEdit(r.id)}>Save</button>
                              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={cancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => beginEdit(r)}>Edit</button>
                          )
                        )}
                        {(!r.status || r.status === 'uploaded') && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => parse(r.id)}>Parse</button>
                        )}
                        {(r.status === 'uploaded' || r.status === 'parsed') && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => match(r.id)}>{r.matchedTransactionId ? 'Rematch' : 'Match'}</button>
                        )}
                        {(r.status === 'uploaded' || r.status === 'parsed' || r.status === 'matched') && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => openSuggestions(r.id)}>Match…</button>
                        )}
                        {r.status === 'matched' && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => post(r.id)}>Post</button>
                        )}
                        {r.status === 'matched' && r.matchedTransactionId && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => openLinked(r.id)}>View match</button>
                        )}
                        {r.status === 'posted' && !r.expenseId && convertingId !== r.id && (
                          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => openConvertPicker(r.id)}>Convert to Expense</button>
                        )}
                        {r.status === 'posted' && !r.expenseId && convertingId === r.id && (
                          <div className="flex items-center gap-1.5">
                            <select
                              className="input input-sm border rounded px-2 py-1"
                              value={selectedAccount}
                              onChange={(e) => setSelectedAccount(e.target.value)}
                              aria-label="Select expense account"
                            >
                              {/* Default option */}
                              <option value="6000">6000 · Operating Expenses</option>
                              {accounts
                                .filter((a) => a.number !== '6000')
                                .map((a) => (
                                  <option key={a.id} value={a.number}>{a.number} · {a.name}</option>
                                ))}
                            </select>
                            <button className="btn-primary !px-2 !py-1 text-xs" onClick={confirmConvert}>Save</button>
                            <button className="btn-secondary !px-2 !py-1 text-xs" onClick={cancelConvert}>Cancel</button>
                          </div>
                        )}
                      <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => remove(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {(r.ocrExtract || (r.suggestedMatchTransactionId && !r.matchedTransactionId) || (r.status && r.status !== 'uploaded')) && (
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="px-3 py-2 text-xs text-slate-700" colSpan={9}>
                      {/* Lifecycle strip */}
                      {(() => {
                        const scanned = r.status === 'parsed' || r.status === 'matched' || r.status === 'posted'
                        const matched = r.status === 'matched' || r.status === 'posted'
                        const posted = r.status === 'posted'
                        const expensed = !!r.expenseId
                        const step = expensed ? 5 : posted ? 4 : matched ? 3 : scanned ? 2 : 1
                        const stepCls = (done: boolean, current: boolean) => done ? 'bg-emerald-600 text-white' : (current ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600')
                        return (
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.5 ${stepCls(true, step===1)}`}>Capture</span>
                            <span className="text-slate-400">→</span>
                            <span className={`rounded px-1.5 py-0.5 ${stepCls(scanned, step===2)}`}>Scan</span>
                            <span className="text-slate-400">→</span>
                            <span className={`rounded px-1.5 py-0.5 ${stepCls(matched, step===3)}`}>Match</span>
                            <span className="text-slate-400">→</span>
                            <span className={`rounded px-1.5 py-0.5 ${stepCls(posted, step===4)}`}>Post</span>
                            <span className="text-slate-400">→</span>
                            <span className={`rounded px-1.5 py-0.5 ${stepCls(expensed, step===5)}`}>Expense</span>
                          </div>
                        )
                      })()}
                      {r.ocrExtract && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
                          <div className="font-medium text-slate-800">OCR preview:</div>
                          {r.ocrExtract.vendor && (<div><span className="text-slate-500">Vendor:</span> {r.ocrExtract.vendor}</div>)}
                          {r.ocrExtract.date && (<div><span className="text-slate-500">Date:</span> {r.ocrExtract.date}</div>)}
                          {typeof r.ocrExtract.amount === 'number' && (<div><span className="text-slate-500">Amount:</span> <Amount value={Number(r.ocrExtract.amount)} /></div>)}
                        </div>
                      )}
                      {r.suggestedMatchTransactionId && !r.matchedTransactionId && (
                        <div className="mt-1 flex items-center justify-between rounded bg-amber-50 px-2 py-1 text-amber-800">
                          <div>Suggested match: {r.suggestedMatchTransactionId}</div>
                          <button
                            className="btn-secondary !px-2 !py-1 text-xs"
                            onClick={async () => {
                              await fetch(`/api/receipts/${encodeURIComponent(r.id)}/match`, {
                                method: 'POST',
                                headers: { 'content-type': 'application/json' },
                                body: JSON.stringify({ transactionId: r.suggestedMatchTransactionId }),
                              })
                              setNotice('Suggestion accepted. Receipt marked as Matched.')
                              await load()
                            }}
                          >
                            Accept suggestion
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md shadow-xl w-[min(96vw,900px)] max-h-[90vh] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Snap Receipt</h2>
              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={closeCamera}>Close</button>
            </div>
            {cameraError && (
              <div className="text-red-700 text-sm">{cameraError}</div>
            )}
            {!cameraError && (
              <div className="grid gap-3 grid-cols-1">
                {!capturedUrl ? (
                  <div className="w-full aspect-video bg-black rounded overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-slate-200 rounded overflow-hidden">
                    <img src={capturedUrl} alt="Captured" className="w-full h-full object-contain" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex items-center gap-2 justify-between">
                  {/* Inline scan status */}
                  <div className="text-sm">
                    {cameraPhase === 'scanning' && (
                      <span className="text-slate-600">Scanning receipt…</span>
                    )}
                    {cameraPhase === 'scanned' && (
                      <span className="text-emerald-700">Scanned. Next: Match → Post → Convert to Expense.</span>
                    )}
                    {cameraPhase === 'error' && (
                      <span className="text-red-700">Scan failed. You can retake or try again.</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!capturedUrl ? (
                      <button className="btn-primary" onClick={takePhoto}>Capture</button>
                    ) : cameraPhase === 'scanning' ? (
                      <>
                        <button className="btn-secondary" onClick={retakePhoto} disabled>Retake</button>
                        <button className="btn-primary" onClick={usePhoto} disabled>Use Photo</button>
                      </>
                    ) : cameraPhase === 'scanned' ? (
                      <>
                        <button className="btn-secondary" onClick={retakePhoto}>Retake</button>
                        <button className="btn-primary" onClick={closeCamera}>Done</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-secondary" onClick={retakePhoto}>Retake</button>
                        <button className="btn-primary" onClick={usePhoto}>Use Photo</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions / Manual Match Modal */}
      {suggestionsModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md shadow-xl w-[min(95vw,720px)] max-h-[88vh] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Match Receipt</h2>
              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={closeSuggestions}>Close</button>
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>Select a suggested document or enter an id manually.</div>
              <div>Ranking considers vendor similarity, amount proximity, and date proximity. Score is a composite (0–100%). Similarity is raw vendor name similarity.</div>
              {suggestionsNegative && (
                <div className="text-amber-700">Outflow amount detected — showing bill-only matches.</div>
              )}
              {suggestions.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-1 text-[11px]" htmlFor="minScore">
                    Score ≥
                    <span className="font-mono">{Math.round(scoreThreshold * 100)}</span>%
                  </label>
                  <input
                    id="minScore"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(scoreThreshold * 100)}
                    onChange={e => setScoreThreshold(Number(e.target.value)/100)}
                    aria-label="Minimum composite score"
                    className="w-32 accent-emerald-600"
                  />
                  <button
                    className="btn-secondary !px-2 !py-0.5 text-[11px]"
                    onClick={() => setScoreThreshold(0)}
                  >Reset</button>
                </div>
              )}
            </div>
            {suggestionsLoading && (<div className="text-slate-700 text-sm">Loading suggestions…</div>)}
            {suggestionsError && (<div className="text-red-700 text-sm">{suggestionsError}</div>)}
            {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
              <div className="text-slate-500 text-sm">No suggestions found. You can still manual match.</div>
            )}
            {suggestions.length > 0 && (
              <table className="w-full text-sm border border-slate-200 rounded overflow-hidden">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Kind</th>
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-right">Remaining</th>
                    <th className="px-2 py-1 text-right">Amt Δ</th>
                    <th className="px-2 py-1 text-right">Date Δ (days)</th>
                    <th className="px-2 py-1 text-right" title="Composite score (higher is better)">Score</th>
                    <th className="px-2 py-1 text-right" title="Vendor name similarity (raw)">Similarity</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.filter(s => (typeof s.score !== 'number' || s.score >= scoreThreshold)).map(s => (
                    <tr key={s.kind + ':' + s.id} className="border-t border-slate-200">
                      <td className="px-2 py-1 capitalize">{s.kind}</td>
                      <td className="px-2 py-1 font-mono text-xs">{s.id}</td>
                      <td className="px-2 py-1 truncate max-w-[12rem]" title={s.name}>{s.name || '-'}</td>
                      <td className="px-2 py-1 text-right tabular-nums"><Amount value={s.remaining} /></td>
                      <td className="px-2 py-1 text-right tabular-nums">{s.amountDifference.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{s.dateDifferenceDays}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{typeof s.score === 'number' ? Math.round(s.score * 100) + '%' : '-'}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{typeof s.vendorSimilarity === 'number' ? Math.round(s.vendorSimilarity * 100) + '%' : '-'}</td>
                      <td className="px-2 py-1 text-right">
                        <button className="btn-primary !px-2 !py-1 text-xs" onClick={() => applySuggestion(suggestionsModalId, s.id)}>Apply</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between mt-2">
              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => manualMatch(suggestionsModalId)}>Manual match…</button>
              <div className="text-[11px] text-slate-500">Matching locks edits after successful post; verify vendor/date/amount first.</div>
            </div>
          </div>
        </div>
      )}
      {/* Linked Match Preview Modal */}
      {linkedPreviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md shadow-xl w-[min(95vw,560px)] max-h-[85vh] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Matched Document</h2>
              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={closeLinked}>Close</button>
            </div>
            {linkedLoading && (<div className="text-slate-700 text-sm">Loading…</div>)}
            {linkedError && (<div className="text-red-700 text-sm">{linkedError}</div>)}
            {!linkedLoading && !linkedError && linkedPreview && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded bg-sky-100 text-sky-800 px-2 py-0.5 text-xs font-medium">{linkedPreview.type}</span>
                  {linkedPreview.number && (<span className="font-mono text-xs text-slate-700">{linkedPreview.number}</span>)}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-slate-500">ID:</span> <span className="font-mono text-xs">{linkedPreview.id}</span></div>
                  <div><span className="text-slate-500">Date:</span> {linkedPreview.date}</div>
                  {linkedPreview.dueDate && (<div><span className="text-slate-500">Due:</span> {linkedPreview.dueDate}</div>)}
                  <div><span className="text-slate-500">Party:</span> {linkedPreview.vendorOrCustomer}</div>
                  <div><span className="text-slate-500">Status:</span> <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{linkedPreview.status}</span></div>
                  <div><span className="text-slate-500">Original:</span> <Amount value={linkedPreview.amountOriginal} /></div>
                  {typeof linkedPreview.amountOpen === 'number' && (<div><span className="text-slate-500">Open:</span> <Amount value={linkedPreview.amountOpen} /></div>)}
                  <div><span className="text-slate-500">Lines:</span> {linkedPreview.lineCount}</div>
                  {linkedPreview.currency && (<div><span className="text-slate-500">Currency:</span> {linkedPreview.currency}</div>)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <a href={`/${linkedPreview.type === 'invoice' ? 'invoices' : 'bills'}/${linkedPreview.id}`} target="_blank" className="btn-primary !px-2 !py-1 text-xs">Open full record ↗</a>
                  <div className="text-[11px] text-slate-500">Preview is read-only. Use the document page for edits.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

