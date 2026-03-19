"use client"
import React from 'react'
import { motion } from 'motion/react'
import {
  Calculator, FileText, Receipt, Landmark,
  PieChart, Coins, TrendingUp, Briefcase,
} from 'lucide-react'

const DUST_COUNT = 60

interface BackgroundEffectsProps {
  className?: string
  isFixed?: boolean
  showFlashlight?: boolean
}

export const BackgroundEffects = React.memo(function BackgroundEffects({
  className = '',
  isFixed = true,
  showFlashlight = true,
}: BackgroundEffectsProps) {
  const dustParticles = React.useMemo(
    () =>
      Array.from({ length: DUST_COUNT }).map(() => ({
        startX: Math.random() * 100 + '%',
        startY: Math.random() * 100 + '%',
        size: Math.random() * 4 + 4,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * -30,
        moveX: (Math.random() - 0.5) * 400,
        moveY: (Math.random() - 0.5) * 400,
      })),
    [],
  )

  const floatingIcons = React.useMemo(
    () =>
      [
        { Icon: Calculator,  size: 48 },
        { Icon: FileText,    size: 54 },
        { Icon: Receipt,     size: 42 },
        { Icon: Landmark,    size: 60 },
        { Icon: PieChart,    size: 52 },
        { Icon: Coins,       size: 40 },
        { Icon: TrendingUp,  size: 58 },
        { Icon: Briefcase,   size: 48 },
        { Icon: Calculator,  size: 40 },
        { Icon: FileText,    size: 45 },
        { Icon: Receipt,     size: 38 },
        { Icon: Landmark,    size: 50 },
      ].map((item) => ({
        ...item,
        startX:   Math.random() * 100 + '%',
        startY:   Math.random() * 100 + '%',
        duration: Math.random() * 20 + 20,
        delay:    Math.random() * -40,
        moveX:    (Math.random() - 0.5) * 300,
        moveY:    (Math.random() - 0.5) * 300,
        rotate:   Math.random() * 360,
      })),
    [],
  )

  return (
    <div
      className={`${isFixed ? 'fixed' : 'absolute'} inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* Subtle green glow centre */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

      {/* Moving flashlight */}
      {showFlashlight && (
        <motion.div
          animate={{
            x: ['-20%', '20%', '20%', '-20%', '-20%'],
            y: ['-20%', '-20%', '20%', '20%', '-20%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.25)_0%,transparent_70%)] blur-[60px] z-[-1]"
        />
      )}

      {/* Floating accounting icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={`icon-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            x:       [0, item.moveX],
            y:       [0, item.moveY],
            opacity: [0, 0.4, 0.4, 0],
            rotate:  [item.rotate, item.rotate + 45, item.rotate - 45, item.rotate],
            scale:   [0.8, 1, 1, 0.8],
          }}
          transition={{
            duration: item.duration,
            repeat:   Infinity,
            delay:    item.delay,
            ease:     'easeInOut',
          }}
          className="absolute text-emerald-600/50"
          style={{ left: item.startX, top: item.startY }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}

      {/* Dust particles */}
      {dustParticles.map((dust, i) => (
        <motion.div
          key={`dust-${i}`}
          initial={{ opacity: 0 }}
          animate={{
            x:       [0, dust.moveX],
            y:       [0, dust.moveY],
            opacity: [0, 0.8, 0.8, 0],
            scale:   [1, 1.5, 1.5, 1],
          }}
          transition={{
            duration: dust.duration,
            repeat:   Infinity,
            delay:    dust.delay,
            ease:     'easeInOut',
          }}
          className="absolute bg-emerald-400/50 rounded-full blur-[0.5px]"
          style={{
            width:  dust.size,
            height: dust.size,
            left:   dust.startX,
            top:    dust.startY,
          }}
        />
      ))}
    </div>
  )
})
