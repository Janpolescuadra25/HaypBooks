import SectionComingSoon from '@/components/owner/SectionComingSoon'

type Props = { params: { slug?: string[] } }

export default function Page({ params }: Props) {
  return <SectionComingSoon sectionId='banking' params={params} />
}
