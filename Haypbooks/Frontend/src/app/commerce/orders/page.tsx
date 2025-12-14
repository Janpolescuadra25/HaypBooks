import CommerceNav from '@/components/CommerceNav'

export default function CommerceOrdersPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce/orders" /></div>
      <div className="glass-card">Orders — Coming soon.</div>
    </div>
  )
}
