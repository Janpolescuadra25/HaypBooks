import CommerceNav from '@/components/CommerceNav'

export default function CommercePage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce" /></div>
      <div className="glass-card">Commerce — Choose a tab above.</div>
    </div>
  )
}
