'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Globe, Zap, BarChart3, Smartphone } from 'lucide-react'

const CHAPTERS = [
  {
    problem:   'Drowning in a sea of disconnected apps.',
    solution:  'A Unified Ecosystem',
    detail:    'Replace five subscriptions with one. HaypBooks connects every corner of your business into a single, seamless command center.',
    Icon:      Globe,
    from:      'from-emerald-900',
    to:        'to-emerald-950',
  },
  {
    problem:   'Buried under endless paperwork and manual entry.',
    solution:  'Enterprise Automation',
    detail:    'Smart AI handles your receipts, reconciliations, and reminders — so you can focus on growth, not admin.',
    Icon:      Zap,
    from:      'from-emerald-800',
    to:        'to-emerald-900',
  },
  {
    problem:   'Making decisions based on last month\'s numbers.',
    solution:  'Clarity in Every Click',
    detail:    'Real-time dashboards and instant reports turn your data into confident, forward-looking decisions.',
    Icon:      BarChart3,
    from:      'from-emerald-700',
    to:        'to-emerald-800',
  },
  {
    problem:   'You built a business, but you\'re still doing everything yourself.',
    solution:  'Freedom to Scale',
    detail:    'Delegate, automate, and expand. Roles, permissions, and mobile access let your whole team work anywhere.',
    Icon:      Smartphone,
    from:      'from-emerald-600',
    to:        'to-emerald-700',
  },
]

export default function JourneySteps() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative">


      {CHAPTERS.map((ch, i) => (
        <ChapterSection key={i} chapter={ch} index={i} />
      ))}
    </div>
  )
}

function ChapterSection({
  chapter,
  index,
}: {
  chapter: typeof CHAPTERS[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0.1, 0.3], [40, 0])
  const { Icon } = chapter

  return (
    <section
      ref={ref}
      className={`min-h-screen sticky top-0 flex items-center justify-center bg-gradient-to-br ${chapter.from} ${chapter.to} overflow-hidden`}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Chapter number */}
      <div className="absolute top-8 right-8 text-white/10 font-extrabold text-[8rem] leading-none select-none">
        {String(index + 1).padStart(2, '0')}
      </div>

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center"
      >
        {/* Left: text */}
        <div>
          <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-4">
            The Old Way
          </p>
          <p className="text-2xl md:text-3xl text-rose-400/80 font-medium mb-10 line-through decoration-rose-500/60 blur-[0.4px]">
            {chapter.problem}
          </p>

          <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-3">
            The HaypBooks Way
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {chapter.solution}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            {chapter.detail}
          </p>
        </div>

        {/* Right: icon + skeleton visual */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
              <Icon className="w-10 h-10 text-emerald-300" />
            </div>
            <div className="w-full space-y-3">
              <div className="h-2.5 bg-white/10 rounded-full w-3/4 mx-auto" />
              <div className="h-2.5 bg-white/10 rounded-full w-1/2 mx-auto" />
              <div className="flex gap-2 justify-center mt-4">
                {[40, 65, 55, 80, 50, 70, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-5 bg-emerald-400/30 rounded-t"
                    style={{ height: `${h * 0.4}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
