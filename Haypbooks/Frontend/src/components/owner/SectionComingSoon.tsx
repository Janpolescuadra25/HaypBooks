import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

type SectionComingSoonProps = {
  sectionId: string
  params: { slug?: string[] }
  ent?: boolean
}

function resolveTitle(sectionId: string, slug: string[] | undefined): string {
  const section = ownerNav.find((s) => s.id === sectionId)
  if (!slug || slug.length === 0) return section?.label ?? 'Coming Soon'
  const href = '/' + [sectionId, ...slug].join('/')

  for (const sec of ownerNav) {
    for (const grp of sec.groups ?? []) {
      const found = grp.items.find((it) => it.href === href)
      if (found) return found.label ?? ''
    }
  }

  const last = slug[slug.length - 1] ?? ''
  return last
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function SectionComingSoon({ sectionId, params, ent = false }: SectionComingSoonProps) {
  return <ComingSoon title={resolveTitle(sectionId, params.slug)} ent={ent} />
}
