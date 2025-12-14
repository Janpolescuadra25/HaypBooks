import StoryHero from '@/components/landing/StoryHero'
import JourneySteps from '@/components/landing/JourneySteps'
import Features from '@/components/landing/Features'
import ModernPricing from '@/components/landing/ModernPricing'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white">
      <StoryHero />
      <JourneySteps />
      <Features />
      <ModernPricing />
      <Testimonials />
      <Footer />
    </div>
  )
}
