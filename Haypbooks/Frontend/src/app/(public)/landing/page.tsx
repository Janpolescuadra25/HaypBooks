import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import StoryHero from '@/components/landing/StoryHero'
import JourneySteps from '@/components/landing/JourneySteps'
import Industries from '@/components/landing/Industries'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'
import LandingTweakControls from '@/components/landing/LandingTweakControls'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <LandingHeader />
      <main>
        <StoryHero />
        <JourneySteps />
        <Industries />
        <Features />
        <HowItWorks />
        <Testimonials />

        {/* Final CTA */}
        <section className="py-32 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-emerald-600 rounded-[60px] px-10 py-20 relative overflow-hidden shadow-2xl shadow-emerald-600/30">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-950/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Ready to run your<br />business better?
                </h2>
                <p className="text-emerald-100/80 text-lg mb-10 max-w-lg mx-auto">
                  Join hundreds of Philippine business owners who already save hours every week with HaypBooks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 text-base"
                  >
                    Get Started — It&apos;s Free
                  </Link>
                  <a
                    href="mailto:hello@haypbooks.com"
                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base border border-white/20"
                  >
                    Talk to our team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <LandingTweakControls />
    </div>
  )
}
