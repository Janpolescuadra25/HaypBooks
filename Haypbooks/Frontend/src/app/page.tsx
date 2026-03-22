'use client'

import dynamic from 'next/dynamic'

const CinematicIntro = dynamic(() => import('@/components/CinematicIntro'), { ssr: false })

export default function Home() {
  return <CinematicIntro />
}
