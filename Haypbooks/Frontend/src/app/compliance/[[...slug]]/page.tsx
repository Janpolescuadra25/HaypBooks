import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

type Props = { params: { slug?: string[] } }

function resolveTitle(sectionId: string, slug: string[] | undefined): string {
  const section = ownerNav.find((s) => s.id === sectionId)
  if (!slug || slug.length === 0) return section?.label ?? 'Compliance'
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

export default function Page({ params }: Props) {
  return <ComingSoon title={resolveTitle('compliance', params.slug)} ent />
}
