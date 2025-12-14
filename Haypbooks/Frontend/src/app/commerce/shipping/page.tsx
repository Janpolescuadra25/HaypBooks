import CommerceNav from '@/components/CommerceNav'

export default function CommerceShippingPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce/shipping" /></div>
      <div className="glass-card">Shipping — Coming soon.</div>
    </div>
  )
}
