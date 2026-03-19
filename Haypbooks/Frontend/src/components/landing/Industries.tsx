'use client'
import { motion } from 'motion/react'

const INDUSTRIES = [
  { name: 'Retail & Shops',          icon: '🏪' },
  { name: 'Restaurants & Cafes',     icon: '🍽️' },
  { name: 'Construction',            icon: '🏗️' },
  { name: 'Professional Services',   icon: '💼' },
  { name: 'Manufacturing',           icon: '🏭' },
  { name: 'E-commerce',              icon: '🛒' },
  { name: 'Healthcare & Clinics',    icon: '🏥' },
  { name: 'Transportation',          icon: '🚚' },
  { name: 'Real Estate',             icon: '🏘️' },
]

export default function Industries() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">Industries</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Built For Your Industry
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Whether you sell products or services, HaypBooks molds to the way your business works.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium text-sm cursor-default hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              <span className="text-xl">{ind.icon}</span>
              {ind.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
