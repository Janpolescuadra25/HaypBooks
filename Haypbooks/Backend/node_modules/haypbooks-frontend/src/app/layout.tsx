import "@/styles/globals.css"
import { ReactNode } from "react"
import dynamic from 'next/dynamic'
const ClientRoot = dynamic(() => import('./client-root'), { ssr: false })
import { ToastProvider } from '@/components/ToastProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

export const metadata = {
  title: "HaypBooks",
  description: "Accounting, reimagined.",
}

// NOTE: RootLayout is a Server Component; client interactivity handled in ClientRoot.

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen h-full text-slate-900 antialiased selection:bg-sky-200/60 selection:text-slate-900">
        <ToastProvider>
          <CurrencyProvider>
            <ClientRoot>
              {children}
              {modal}
            </ClientRoot>
          </CurrencyProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
