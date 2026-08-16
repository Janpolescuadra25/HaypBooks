'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Book, Receipt, Landmark, DollarSign, Wallet, FileText, PieChart } from 'lucide-react';

const stories = [
  {
    title: 'Financial Clarity',
    description: 'See your business health in real-time with precision and ease.',
    color: 'from-emerald-900 to-emerald-700',
  },
  {
    title: 'Built for Growth',
    description: 'From startups to enterprises, scale your operations with confidence.',
    color: 'from-emerald-800 to-emerald-600',
  },
  {
    title: 'Intelligent Support',
    description: 'AI that makes bookkeeping easy and helps you understand exactly how your business is working.',
    color: 'from-emerald-700 to-emerald-500',
  },
  {
    isLogo: true,
    color: 'from-emerald-600 to-emerald-400',
  },
];

const ACCOUNTING_ICONS = [Calculator, Book, Receipt, Landmark, DollarSign, Wallet, FileText, PieChart];

export default function CinematicIntro() {
  const router = useRouter();
  const [currentStory, setCurrentStory] = useState(0);

  const particles = useMemo(
    () =>
      [...Array(150)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 4,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
      })),
    []
  );

  const floatingIcons = useMemo(
    () =>
      [...Array(25)].map((_, i) => ({
        id: i,
        Icon: ACCOUNTING_ICONS[i % ACCOUNTING_ICONS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 25 + Math.random() * 40,
        duration: 12 + Math.random() * 25,
        delay: Math.random() * 10,
        rotation: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    if (currentStory < stories.length) {
      const timer = setTimeout(() => {
        setCurrentStory((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem('haypbooks_intro_seen', 'true');
      router.push('/landing');
    }
  }, [currentStory, router]);

  const handleSkip = () => {
    localStorage.setItem('haypbooks_intro_seen', 'true');
    router.push('/landing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating accounting icons */}
        {floatingIcons.map((item) => (
          <motion.div
            key={`icon-${item.id}`}
            className="absolute text-emerald-400/20"
            initial={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              rotate: item.rotation,
              opacity: 0,
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, 60, 0],
              rotate: item.rotation + 360,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'linear',
            }}
          >
            <item.Icon size={item.size} />
          </motion.div>
        ))}

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={`p-${p.id}`}
            className="absolute rounded-full bg-emerald-300/30"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -250],
              opacity: [0, 1, 0],
              scale: [0, 1.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Story content */}
      <AnimatePresence mode="wait">
        {currentStory < stories.length && (
          <motion.div
            key={currentStory}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-center px-6"
          >
            {stories[currentStory].isLogo ? (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex px-8">
                  {'HaypBooks'.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 200, opacity: 0, rotate: 45 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 12,
                        delay: i * 0.1,
                        duration: 0.8,
                      }}
                      className="inline-block text-7xl font-black tracking-tighter text-white md:text-9xl lg:text-[12rem]"
                      style={{ textShadow: '0 0 40px rgba(16,185,129,0.4)' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                <motion.h1 className="mb-4 text-5xl font-bold tracking-tighter text-white md:text-7xl">
                  {stories[currentStory].title}
                </motion.h1>
                <motion.p className="text-xl text-emerald-100/80 md:text-2xl max-w-2xl mx-auto">
                  {stories[currentStory].description}
                </motion.p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ delay: 1.5 }}
        onClick={handleSkip}
        className="absolute bottom-12 left-1/2 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white/60 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white hover:border-white/30"
      >
        Skip
      </motion.button>

      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-40"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, #10b981 0%, transparent 50%)',
            'radial-gradient(circle at 40% 60%, #059669 0%, transparent 50%)',
            'radial-gradient(circle at 60% 40%, #047857 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  );
}
