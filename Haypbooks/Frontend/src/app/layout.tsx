import "@/styles/globals.css"
import { ReactNode } from "react"
import ClientRoot from './client-root'
import { ToastProvider } from '@/components/ToastProvider'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata = {
  title: "HaypBooks",
  description: "Accounting, reimagined.",
}

// Prevent static generation — all pages depend on React context
// provided by ClientRoot. Without this, next build tries to
// pre-render pages at build time where the context is null.
export const dynamic = 'force-dynamic'

// NOTE: RootLayout is a Server Component; client interactivity handled in ClientRoot.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-screen h-full text-slate-900 antialiased selection:bg-sky-200/60 selection:text-slate-900">
        <ClientRoot>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClientRoot>
      </body>
    </html>
  )
}
