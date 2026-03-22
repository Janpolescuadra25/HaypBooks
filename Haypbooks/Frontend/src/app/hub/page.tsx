'use client'

import { redirect } from 'next/navigation'

export default function Page() {
  // /hub now redirects to the unified Dashboard
  redirect('/dashboard')
}