import React, { useState } from 'react';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';
import MyTasks from './pages/MyTasks';
import BusinessHealth from './pages/BusinessHealth';
import Shortcuts from './pages/Shortcuts';
import Invoices from './pages/Invoices';
import Vendors from './pages/Vendors';
import JournalEntries from './pages/JournalEntries';
import GeneralLedger from './pages/GeneralLedger';
import { motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'Dashboard' | 'My Tasks' | 'Business Health' | 'Shortcuts' | 'Invoices' | 'Vendors' | 'Journal Entries' | 'General Ledger'>('Dashboard');

  return (
    <div className="min-h-screen bg-brand-surface text-slate-900 font-sans selection:bg-brand-emerald/20 selection:text-brand-emerald-dark">
      {/* Background Gradients for Depth - Emerald + White Style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-emerald/5 blur-[140px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-emerald-200/20 blur-[140px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-slate-100/50 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      <TopBar />
      
      <div className="flex pt-16">
        <SideNav onNavigate={(page) => setCurrentPage(page as any)} activePage={currentPage} />
        
        <main className="flex-1 ml-[320px] transition-all duration-300 p-8">
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-full ${currentPage === 'Dashboard' || currentPage === 'Shortcuts' ? 'max-w-7xl mx-auto' : ''}`}
          >
            {currentPage === 'Dashboard' ? (
              <>
                {/* Dashboard Hero Section */}
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                      Good Morning, <span className="text-brand-emerald-dark">John Paul</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                      Here's what's happening with <span className="text-slate-900">Tech Corp USA</span> today.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-emerald/30 transition-all shadow-sm">
                      View Reports
                    </button>
                    <button className="px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all">
                      Create Invoice
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Revenue', value: '$128,430', trend: '+12.5%', color: 'brand-emerald', glow: 'emerald-glow' },
                    { label: 'Active Projects', value: '42', trend: '+3', color: 'brand-emerald', glow: 'emerald-glow' },
                    { label: 'Pending Approvals', value: '18', trend: '-2', color: 'amber-500', glow: '' },
                    { label: 'Cash on Hand', value: '$45,200', trend: '+5.2%', color: 'brand-emerald', glow: 'emerald-glow' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-6 glass-morphism rounded-3xl hover:border-brand-emerald/30 transition-all group cursor-pointer ${stat.glow}`}
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          stat.trend.startsWith('+') ? 'bg-brand-emerald/10 text-brand-emerald-dark' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000"
                          style={{ 
                            width: '65%', 
                            backgroundColor: stat.color.includes('brand') ? 'var(--color-brand-emerald)' : '#F59E0B',
                          }} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-[400px] glass-morphism rounded-3xl p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Revenue Overview</h2>
                        <div className="flex gap-2">
                          {['1W', '1M', '3M', '1Y'].map(t => (
                            <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t === '1M' ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-full h-[240px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden group bg-slate-50/50">
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-slate-400 font-medium italic relative z-10">Chart Visualization Placeholder</p>
                        {/* Mock Chart Line */}
                        <svg className="absolute bottom-0 left-0 w-full h-32 text-brand-emerald/10" preserveAspectRatio="none">
                          <path d="M0 128 C 100 80, 200 100, 300 40 S 500 20, 800 100" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </div>
                      <div className="mt-6 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-brand-emerald" />
                          <span className="text-xs text-slate-500">Actual Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-300" />
                          <span className="text-xs text-slate-500">Projected Growth</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="glass-morphism rounded-3xl p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-emerald-500/10">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-brand-emerald/30 transition-all">
                              <div className={`w-2 h-2 rounded-full bg-brand-emerald`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">Invoice #INV-2024-00{i}</p>
                              <p className="text-[10px] text-slate-500">Paid by Client {String.fromCharCode(64 + i)} • {i * 2}h ago</p>
                            </div>
                            <div className="text-xs font-mono text-slate-400">$2,400</div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-6 py-3 text-xs font-bold text-slate-400 hover:text-brand-emerald-dark transition-colors border-t border-slate-100">
                        View All Activity
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : currentPage === 'My Tasks' ? (
              <MyTasks />
            ) : currentPage === 'Business Health' ? (
              <BusinessHealth />
            ) : currentPage === 'Invoices' ? (
              <Invoices />
            ) : currentPage === 'Vendors' ? (
              <Vendors />
            ) : currentPage === 'Journal Entries' ? (
              <JournalEntries />
            ) : currentPage === 'General Ledger' ? (
              <GeneralLedger />
            ) : (
              <Shortcuts />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
