"use client"
import React from 'react'
import Link from 'next/link'

export default function BankImportsHelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="mb-3">
        <h1 className="text-xl font-semibold">Import bank statements</h1>
        <p className="text-slate-600 text-sm">How to bring in historical transactions using statement files.</p>
      </header>
      <section aria-labelledby="supported-formats" className="glass-card p-3 mb-3">
        <h2 id="supported-formats" className="text-base font-medium">Supported formats</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          <li>CSV (comma-separated values)</li>
          <li>OFX (Open Financial Exchange)</li>
          <li>QIF (Quicken Interchange Format)</li>
        </ul>
        <p className="mt-2 text-sm text-slate-600">Tip: If your bank limits online history (for example ~90 days), export older activity from your bank website as CSV/OFX/QIF and import here.</p>
      </section>
      <section aria-labelledby="how-to-import" className="glass-card p-3 mb-3">
        <h2 id="how-to-import" className="text-base font-medium">How to import</h2>
        <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
          <li>Go to <span className="font-medium">Bank Transactions</span>.</li>
          <li>Choose the <span className="font-medium">For Review</span> tab.</li>
          <li>Click <span className="font-medium">Upload statement</span> and select your CSV/OFX/QIF file.</li>
          <li>After upload, review items in For Review; use <span className="font-medium">Match</span> for existing documents, <span className="font-medium">Add</span> for simple cash items, <span className="font-medium">Transfer</span> for inter-account moves, or <span className="font-medium">Exclude</span> duplicates.</li>
        </ol>
      </section>
      <section aria-labelledby="posting-behavior" className="glass-card p-3 mb-3">
        <h2 id="posting-behavior" className="text-base font-medium">Posting behavior</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Items stay in <em>For Review</em> until you act; they don’t affect reports until Matched/Added/Transferred.</li>
          <li>Matching first prevents duplicates and preserves A/R or A/P when applicable.</li>
          <li>Reconciliation remains a separate workflow against a statement end balance and date.</li>
        </ul>
      </section>
      <nav className="mt-4">
        <Link href="/bank-transactions" className="btn-primary" aria-label="Back to Bank Transactions">Back to Bank Transactions</Link>
      </nav>
    </div>
  )
}
