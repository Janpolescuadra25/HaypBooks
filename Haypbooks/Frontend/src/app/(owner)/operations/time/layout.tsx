'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function TimeLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="time">
      {children}
    </TabbedSectionLayout>
  )
}
