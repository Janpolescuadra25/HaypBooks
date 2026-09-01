import "@/styles/globals.css"
import { ReactNode } from "react"
import ClientRoot from './client-root'
import { ToastProvider } from '@/components/ToastProvider'
import { Inter, Orbitron, Press_Start_2P, Space_Grotesk } from 'next/font/google'

// Prevent static pre-rendering — the entire app relies on React contexts
// (AppRouter, PathnameContext) that are only available at request-time.
// Without this, next build pre-renders pages and hits null useContext.
export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-press-start-2p',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata = {
  title: "HaypBooks",
  description: "Accounting, reimagined.",
  metadataBase: new URL('https://haypbooks.com'),
  icons: {
    icon: '/HB_Logo.png',
  },
}

// NOTE: RootLayout is a Server Component; client interactivity handled in ClientRoot.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${orbitron.variable} ${pressStart2P.variable} ${spaceGrotesk.variable}`}>
      <body className="h-full overflow-x-hidden text-slate-900 antialiased selection:bg-sky-200/60 selection:text-slate-900">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/hb-logo-favicon.png" />
        <ClientRoot>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClientRoot>
      </body>
    </html>
  )
}
