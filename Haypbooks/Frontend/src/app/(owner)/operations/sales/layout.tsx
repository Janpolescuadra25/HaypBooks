'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="sales">
      {children}
    </TabbedSectionLayout>
  )
}
