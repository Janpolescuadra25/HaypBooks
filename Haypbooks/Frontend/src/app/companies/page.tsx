'use client'

import { redirect } from 'next/navigation'

export default function Page() {
  // Keep legacy route but redirect into the unified Dashboard
  redirect('/dashboard')
}
