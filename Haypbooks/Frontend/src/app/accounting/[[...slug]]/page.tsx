'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

const ChartOfAccountsPage = dynamic(() => import('@/components/accounting/ChartOfAccountsPage'), { ssr: false })
const JournalEntriesPage = dynamic(() => import('@/components/accounting/JournalEntriesPage'), { ssr: false })
const TrialBalancePage = dynamic(() => import('@/components/accounting/TrialBalancePage'), { ssr: false })
const GeneralLedgerPage = dynamic(() => import('@/components/accounting/GeneralLedgerPage'), { ssr: false })
const AccountingPeriodsPage = dynamic(() => import('@/components/accounting/AccountingPeriodsPage'), { ssr: false })
const AccountingHubPage = dynamic(() => import('@/components/accounting/AccountingHubPage'), { ssr: false })
const CloseWorkflowPage = dynamic(() => import('@/app/(owner)/accounting/close-workflow/page'), { ssr: false })

type Props = { params: { slug?: string[] } }

function resolveTitle(sectionId: string, slug: string[] | undefined): string {
  const section = ownerNav.find((s) => s.id === sectionId)
  if (!slug || slug.length === 0) return section?.label ?? 'Accounting'
  const href = '/' + [sectionId, ...slug].join('/')
  for (const sec of ownerNav) {
    for (const grp of (sec.groups ?? [])) {
      const found = grp.items.find((it) => it.href === href)
      if (found) return found.label ?? ''
    }
  }
  const last = slug[slug.length - 1] ?? ''
  return last.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function resolveComponent(slug: string[] | undefined) {
  const path = (slug ?? []).join('/')
  switch (path) {
    case 'core-accounting': return <AccountingHubPage />
    case 'close-workflow': return <CloseWorkflowPage />
    case 'core-accounting/chart-of-accounts': return <ChartOfAccountsPage />
    case 'core-accounting/journal-entries': return <JournalEntriesPage />
    case 'core-accounting/general-ledger': return <GeneralLedgerPage />
    case 'core-accounting/trial-balance': return <TrialBalancePage />
    case 'periods':
    case 'core-accounting/periods': return <AccountingPeriodsPage />
    default: return null
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return <ComingSoon title={resolveTitle('accounting', params.slug)} />
}
