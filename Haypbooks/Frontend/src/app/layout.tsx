import "@/styles/globals.css"
import { ReactNode } from "react"
import ClientRoot from './client-root'
import { ToastProvider } from '@/components/ToastProvider'
import { Inter } from 'next/font/google'

// Prevent static pre-rendering — the entire app relies on React contexts
// (AppRouter, PathnameContext) that are only available at request-time.
// Without this, next build pre-renders pages and hits null useContext.
export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata = {
  title: "HaypBooks",
  description: "Accounting, reimagined.",
}

// NOTE: RootLayout is a Server Component; client interactivity handled in ClientRoot.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full overflow-hidden text-slate-900 antialiased selection:bg-sky-200/60 selection:text-slate-900">
        <ClientRoot>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClientRoot>
      </body>
    </html>
  )
}
