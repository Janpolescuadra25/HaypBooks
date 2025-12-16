import StoryHero from '@/components/landing/StoryHero'
import JourneySteps from '@/components/landing/JourneySteps'
import Features from '@/components/landing/Features'
import ModernPricing from '@/components/landing/ModernPricing'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'

import LandingHeader from '@/components/landing/LandingHeader'
import LandingTweakControls from '@/components/landing/LandingTweakControls'

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white">
      <LandingHeader />
      <main className="pt-0"> {/* header is floating; remove extra top padding and let hero peek under it */}
        <StoryHero />
        <JourneySteps />
        <Features />
        <ModernPricing />
        <Testimonials />
        <Footer />
      </main>

      <LandingTweakControls />
    </div>
  )
}
