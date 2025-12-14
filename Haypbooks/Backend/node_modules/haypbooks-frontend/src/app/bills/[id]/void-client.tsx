"use client"
import { useState } from 'react'
import VoidingModal from '@/components/VoidingModal'

interface Props { id: string }

export default function BillVoidControls({ id }: Props) {
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  return (
    <>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => setOpen(true)}
        disabled={processing}
        title="Void bill"
      >Void</button>
      {open && (
        <VoidingModal
          entity="bill"
          id={id}
          onClose={() => setOpen(false)}
          onDone={() => {
            setProcessing(false)
            setOpen(false)
            if (typeof window !== 'undefined') window.location.reload()
          }}
        />
      )}
    </>
  )
}
