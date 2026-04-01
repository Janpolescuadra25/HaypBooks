// Prevent static pre-rendering — public pages are wrapped by the root layout
// which uses ClientRoot. Pre-rendering fails with null useContext for routing contexts.
export const dynamic = 'force-dynamic'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {children}
    </div>
  )
}
