'use client'
import { motion } from 'motion/react'
import {
  Briefcase, FileText, Package, Users,
  BarChart3, CreditCard, Receipt, Zap,
} from 'lucide-react'

const FEATURES = [
  { Icon: Briefcase,  title: 'Business Management',  desc: 'Everything you need to run daily operations — all in one dashboard.' },
  { Icon: FileText,   title: 'Invoicing & Billing',   desc: 'Create, send, and track professional invoices in seconds.' },
  { Icon: Package,    title: 'Inventory Control',     desc: 'Monitor stock levels, set alerts, and prevent costly shortfalls.' },
  { Icon: Users,      title: 'Team & Payroll',        desc: 'Manage staff schedules, time tracking, and payroll with ease.' },
  { Icon: BarChart3,  title: 'Real-time Reports',     desc: 'Instant profit & loss, balance sheet, and cash-flow insights.' },
  { Icon: CreditCard, title: 'Expense Tracking',      desc: 'Capture receipts on mobile, categorize, and reconcile automatically.' },
  { Icon: Receipt,    title: 'BIR & Compliance',      desc: 'Stay compliant with Philippine tax regulations effortlessly.' },
  { Icon: Zap,        title: 'AI Automation',         desc: 'Let AI handle repetitive bookkeeping so you can focus on growth.' },
]

export default function Features() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Everything Your Business Needs
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            A complete suite of tools — not a patchwork of plugins.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default"
            >
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
