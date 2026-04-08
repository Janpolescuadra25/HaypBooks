'use client'

import { TabbedSectionLayout } from '@/components/layout/tabs/TabbedSectionLayout'

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabbedSectionLayout sectionKey="projects">
      {children}
    </TabbedSectionLayout>
  )
}
