import CommerceNav from '@/components/CommerceNav'

export default function CommerceOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce/overview" /></div>
      <div className="glass-card">Commerce Overview — Coming soon.</div>
    </div>
  )
}
