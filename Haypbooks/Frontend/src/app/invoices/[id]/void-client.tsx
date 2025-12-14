"use client"
import { useState } from 'react'
import VoidingModal from '@/components/VoidingModal'

interface Props { id: string }

export default function ClientVoidControls({ id }: Props) {
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  return (
    <>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => setOpen(true)}
        disabled={processing}
        title="Void invoice"
      >Void</button>
      {open && (
        <VoidingModal
          entity="invoice"
            id={id}
            onClose={() => setOpen(false)}
            onDone={() => {
              setProcessing(false)
              setOpen(false)
              // simplest approach: reload page to fetch updated invoice state
              if (typeof window !== 'undefined') window.location.reload()
            }}
        />
      )}
    </>
  )
}
