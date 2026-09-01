import ParticleField from '@/components/landing/ParticleField'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Ticker from '@/components/landing/Ticker'
import StatsBar from '@/components/landing/StatsBar'
import Classes from '@/components/landing/Classes'
import BossFight from '@/components/landing/BossFight'
import QuestMap from '@/components/landing/QuestMap'
import Achievements from '@/components/landing/Achievements'
import Pricing from '@/components/landing/Pricing'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'
import AchievementToast from '@/components/landing/AchievementToast'
import IntroSequence from '@/components/landing/IntroSequence'

export default function LandingExperience() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <ParticleField />
      <Navbar />

      <main className="relative">
        <Hero />
        <Ticker />
        <StatsBar />
        <Classes />
        <BossFight />
        <QuestMap />
        <Achievements />
        <Pricing />
        <FinalCTA />
      </main>

      <Footer />
      <AchievementToast />
      <IntroSequence />
    </div>
  )
}
