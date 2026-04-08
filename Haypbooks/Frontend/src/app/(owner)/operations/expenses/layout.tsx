'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="expenses">
      {children}
    </TabbedSectionLayout>
  )
}
