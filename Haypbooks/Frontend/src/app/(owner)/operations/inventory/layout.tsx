'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="inventory">
      {children}
    </TabbedSectionLayout>
  )
}
