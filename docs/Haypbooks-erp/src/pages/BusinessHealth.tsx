import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  ShieldCheck,
  Zap,
  Filter,
  ChevronDown,
  Calendar,
  Building2,
  Globe,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { name: 'Sep', revenue: 4000, expenses: 2400 },
  { name: 'Oct', revenue: 3000, expenses: 1398 },
  { name: 'Nov', revenue: 2000, expenses: 9800 },
  { name: 'Dec', revenue: 2780, expenses: 3908 },
  { name: 'Jan', revenue: 1890, expenses: 4800 },
  { name: 'Feb', revenue: 2390, expenses: 3800 },
  { name: 'Mar', revenue: 3490, expenses: 4300 },
];

const ratioData = [
  { name: 'Current Ratio', value: 2.4, target: 2.0, status: 'Healthy' },
  { name: 'Quick Ratio', value: 1.8, target: 1.5, status: 'Healthy' },
  { name: 'Debt-to-Equity', value: 0.45, target: 0.5, status: 'Healthy' },
  { name: 'Net Profit Margin', value: 18.5, target: 15.0, status: 'Healthy' },
];

export default function BusinessHealth() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 Months',
    entity: 'All Entities',
    currency: 'USD',
    metric: 'Revenue'
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Business <span className="text-brand-emerald-dark">Health</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Real-time financial vitals and performance metrics for <span className="text-slate-900 font-semibold">Tech Corp USA</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm border ${
              isFilterOpen 
                ? 'bg-brand-emerald/10 border-brand-emerald text-brand-emerald-dark' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-brand-emerald/30'
            }`}
          >
            <Filter size={18} />
            Filters
            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all">
            <Zap size={18} />
            Run AI Audit
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-morphism p-6 rounded-[32px] border border-brand-emerald/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Date Range
                </label>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-emerald/50 transition-all"
                >
                  <option>Last 7 Months</option>
                  <option>Last 12 Months</option>
                  <option>Year to Date</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} /> Entity
                </label>
                <select 
                  value={filters.entity}
                  onChange={(e) => setFilters({...filters, entity: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-emerald/50 transition-all"
                >
                  <option>All Entities</option>
                  <option>Tech Corp USA</option>
                  <option>Tech Corp Europe</option>
                  <option>Tech Corp Asia</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} /> Currency
                </label>
                <select 
                  value={filters.currency}
                  onChange={(e) => setFilters({...filters, currency: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-emerald/50 transition-all"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} /> Primary Metric
                </label>
                <select 
                  value={filters.metric}
                  onChange={(e) => setFilters({...filters, metric: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-emerald/50 transition-all"
                >
                  <option>Revenue</option>
                  <option>Net Profit</option>
                  <option>Operating Margin</option>
                  <option>Cash Flow</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mb-8">
              <button 
                onClick={() => setFilters({dateRange: 'Last 7 Months', entity: 'All Entities', currency: 'USD', metric: 'Revenue'})}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset Filters
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Apply Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Health Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-morphism p-8 rounded-[32px] border border-brand-emerald/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 * (1 - 0.88)}
                  strokeLinecap="round"
                  className="text-brand-emerald"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900">88</span>
                <span className="text-xs font-bold text-brand-emerald uppercase tracking-widest">Excellent</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Overall Health Score</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your business is in excellent financial standing. Revenue is outpacing expenses by <span className="text-brand-emerald-dark font-bold">24%</span>, and your liquidity ratios are well above industry benchmarks.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-brand-emerald/10">
                  <p className="text-[10px] font-bold text-brand-emerald uppercase mb-1">Liquidity</p>
                  <p className="text-lg font-bold text-slate-900">92/100</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-500/10">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Efficiency</p>
                  <p className="text-lg font-bold text-slate-900">84/100</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/20 blur-[40px] rounded-full" />
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-brand-emerald" />
            Risk Assessment
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Market Volatility', risk: 'Low', color: 'bg-brand-emerald' },
              { label: 'Cash Runway', risk: '18 Months', color: 'bg-brand-emerald' },
              { label: 'Debt Exposure', risk: 'Minimal', color: 'bg-brand-emerald' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-brand-emerald">{item.risk}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} w-full opacity-50`} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
            View Detailed Risk Map
          </button>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-morphism p-8 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue vs Expenses</h3>
              <p className="text-xs text-slate-500">Last 7 months performance</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-brand-emerald" /> REVENUE
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> EXPENSES
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-morphism p-8 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Key Financial Ratios</h3>
              <p className="text-xs text-slate-500">Current vs Target Benchmarks</p>
            </div>
            <Info size={18} className="text-slate-300 cursor-help" />
          </div>
          <div className="space-y-6">
            {ratioData.map((ratio, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{ratio.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Target: {ratio.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-brand-emerald-dark">{ratio.value}</p>
                    <p className="text-[9px] font-bold text-brand-emerald uppercase tracking-widest">{ratio.status}</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-brand-emerald rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((ratio.value / (ratio.target * 1.5)) * 100, 100)}%` }}
                  />
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-slate-900 z-10"
                    style={{ left: `${(ratio.target / (ratio.target * 1.5)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Profitability', value: '+14.2%', icon: TrendingUp, desc: 'Net margin increased by 2.1% this month.' },
          { title: 'Burn Rate', value: '$12.4k', icon: Activity, desc: 'Monthly operational costs are stable.' },
          { title: 'Accounts Receivable', value: '$42.8k', icon: DollarSign, desc: 'Average collection time: 24 days.' },
        ].map((insight, i) => (
          <div key={i} className="p-6 glass-morphism rounded-3xl border border-slate-200/50 hover:border-brand-emerald/20 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-brand-emerald/10 transition-colors">
              <insight.icon size={20} className="text-slate-400 group-hover:text-brand-emerald transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">{insight.title}</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-black text-slate-900">{insight.value}</span>
              <ArrowUpRight size={16} className="text-brand-emerald" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{insight.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
