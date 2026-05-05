'use client'

import React, { useRef } from 'react'
import { Paperclip, Trash2, Upload } from 'lucide-react'

export interface AttachmentMeta {
  id: string
  fileName: string
  contentType?: string | null
  size?: number | null
  url?: string
}

interface HaypFileUploadProps {
  attachments: AttachmentMeta[]
  onChange: (attachments: AttachmentMeta[]) => void
  label?: string
  description?: string
  multiple?: boolean
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export default function HaypFileUpload({ attachments, onChange, label = 'Attachments', description, multiple = true }: HaypFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    const next = Array.from(files).map((file) => ({
      id: makeId(),
      fileName: file.name,
      contentType: file.type || null,
      size: file.size ?? null,
    }))
    onChange([...attachments, ...next])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((attachment) => attachment.id !== id))
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Paperclip size={16} className="text-emerald-600" />
            <span>{label}</span>
          </div>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <Upload size={14} /> Upload files
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="mt-5 space-y-3">
        {attachments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No files attached yet.
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{attachment.fileName}</p>
                  <p className="text-xs text-slate-500">{attachment.contentType ?? 'Unknown type'}{attachment.size ? ` · ${Math.round(attachment.size / 1024)} KB` : ''}</p>
                </div>
                <button type="button" onClick={() => removeAttachment(attachment.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
