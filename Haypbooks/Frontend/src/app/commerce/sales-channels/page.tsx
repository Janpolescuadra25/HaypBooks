import CommerceNav from '@/components/CommerceNav'

export default function CommerceSalesChannelsPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce/sales-channels" /></div>
      <div className="glass-card">Sales channels — Coming soon.</div>
    </div>
  )
}
