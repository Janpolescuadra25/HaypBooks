'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function CashBankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="cash-banking">
      {children}
    </TabbedSectionLayout>
  )
}
