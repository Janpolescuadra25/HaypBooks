"use client"
import React, { useState } from 'react'
import Link from 'next/link'

interface ComponentDoc {
  name: string
  description: string
}

interface RelatedPage {
  label: string
  href: string
}

export interface PageDocumentationProps {
  title: string
  module: string
  breadcrumb: string
  badge?: string
  purpose: string
  components: ComponentDoc[]
  tabs?: string[]
  features: string[]
  dataDisplayed: string[]
  userActions: string[]
  relatedPages?: RelatedPage[]
}

export default function PageDocumentation({
  title,
  module,
  breadcrumb,
  badge,
  purpose,
  components,
  tabs,
  features,
  dataDisplayed,
  userActions,
  relatedPages,
}: PageDocumentationProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  if (!isHelpOpen) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">{breadcrumb}</p>
            </div>
            <button
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
              aria-label={`Open documentation for ${title}`}
              onClick={() => setIsHelpOpen(true)}
            >
              ?
            </button>
          </div>
          <div className="mt-5 text-sm text-slate-600">
            Content is coming soon. Click the help button (?) to view full page documentation.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-5xl h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold">Documentation - {title}</h2>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            aria-label="Close documentation modal"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* COMING SOON BANNER */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0">
          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">Coming Soon</p>
          <p className="text-xs text-amber-700 mt-0.5">
            This page is under active development. The documentation below serves as the complete specification for this feature.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800 uppercase tracking-wide border border-amber-300">
            Under Development
          </span>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="bg-white rounded-xl border-l-4 border-emerald-500 border border-emerald-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 uppercase tracking-wider">
                {module}
              </span>
              {badge && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  badge === 'ENT' ? 'bg-purple-950 text-purple-400' :
                  badge === 'PH ONLY' ? 'bg-blue-950 text-blue-400' :
                  badge === 'US ONLY' ? 'bg-red-950 text-red-400' :
                  'bg-gray-900 text-gray-400'
                }`}>
                  {badge}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">{title}</h1>
            <p className="text-xs text-emerald-500 mt-1 font-mono">{breadcrumb}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-medium">Documentation v1.0</span>
          </div>
        </div>
      </div>

      {/* PURPOSE */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
        <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
          </svg>
          Purpose &amp; Overview
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">{purpose}</p>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WHAT YOU'LL SEE */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9" strokeLinecap="round"/>
            </svg>
            What You&apos;ll See
          </h2>
          <ul className="space-y-3">
            {components.map((comp) => (
              <li key={comp.name} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{comp.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{comp.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN: TABS + FEATURES */}
        <div className="space-y-4">
          {tabs && tabs.length > 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round"/>
                </svg>
                Page Tabs / Sections
              </h2>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <span key={tab} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {tab}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Key Features
            </h2>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* DATA DISPLAYED + USER ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 12h18M3 6h18M3 18h12" strokeLinecap="round"/>
            </svg>
            Data Displayed
          </h2>
          <ul className="space-y-2">
            {dataDisplayed.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            User Actions
          </h2>
          <ul className="space-y-2">
            {userActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RELATED PAGES */}
      {relatedPages && relatedPages.length > 0 && (
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-6 py-5">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Related Pages
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center py-3">
        <p className="text-[11px] text-gray-400 font-mono uppercase tracking-widest">
          System Status: Under Development &nbsp;·&nbsp; Documentation v1.0 &nbsp;·&nbsp; Haypbooks Platform
        </p>
      </div>
        </div>
      </div>
    </div>
  )
}
