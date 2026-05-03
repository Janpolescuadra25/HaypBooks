import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Mail, 
  ChevronDown, 
  ChevronRight, 
  Maximize2, 
  Calendar,
  Layers,
  Settings2,
  FileText,
  Share2,
  Table as TableIcon,
  TrendingUp,
  CheckCircle2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface LedgerTransaction {
  id: string;
  date: string;
  type: string;
  num: string;
  name: string;
  description: string;
  split: string;
  amount: number;
}

interface AccountGroup {
  id: string;
  accountCode: string;
  accountName: string;
  beginningBalance: number;
  transactions: LedgerTransaction[];
}

const mockGroups: AccountGroup[] = [
  {
    id: 'g1',
    accountCode: '10101',
    accountName: 'Petty Cash on Hand',
    beginningBalance: 19025.00,
    transactions: [
      { id: 't1', date: '2026-04-13', type: 'Check', num: '1543', name: 'Cash', description: 'Bar Banks Check Paid', split: '10301 Cash in Bank', amount: 3500.00 },
    ]
  },
  {
    id: 'g2',
    accountCode: '10201',
    accountName: 'Cash in ATM',
    beginningBalance: 45312.02,
    transactions: [
      { id: 't2', date: '2026-04-13', type: 'Check', num: '303', name: '', description: 'Check Paid', split: '10201 Cash in ATM', amount: -2000.00 },
      { id: 't3', date: '2026-04-13', type: 'Check', num: '303', name: '', description: 'Check Paid', split: '10201 Cash in ATM', amount: 2000.00 },
      { id: 't4', date: '2026-04-27', type: 'Deposit', num: '', name: 'Cash Receivable', description: 'CDS P441085 STL', split: '10201 Cash in ATM', amount: 200.00 },
      { id: 't5', date: '2026-04-27', type: 'Deposit', num: '', name: 'Cash Receivable', description: 'CDS P441085 STL', split: '10201 Cash in ATM', amount: -200.00 },
    ]
  },
  {
    id: 'g3',
    accountCode: '10301',
    accountName: 'Cash in Bank - Operations',
    beginningBalance: 33892.27,
    transactions: [
      { id: 't6', date: '2026-04-01', type: 'Bill Payment', num: 'Auto', name: 'Atlantic City Electric', description: 'Utility Payment', split: '20101 Accounts Payable', amount: -14.87 },
      { id: 't7', date: '2026-04-01', type: 'Bill Payment', num: 'Auto', name: 'Atlantic City Electric', description: 'Utility Payment', split: '20101 Accounts Payable', amount: -74.73 },
      { id: 't8', date: '2026-04-01', type: 'Expense', num: '', name: '', description: 'SPOTON TRANSACT ACH', split: '68000 General Expenses', amount: -55.00 },
    ]
  }
];

export default function GeneralLedger() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['g1', 'g2', 'g3']));
  const [accountingMethod, setAccountingMethod] = useState<'Cash' | 'Accrual'>('Accrual');
  const [dateRange, setDateRange] = useState({ from: '2026-04-01', to: '2026-04-30' });
  const [layout, setLayout] = useState<'Standard' | 'Compact'>('Standard');

  const toggleGroup = (id: string) => {
    const next = new Set(expandedGroups);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedGroups(next);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button className="flex items-center gap-1 text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-2 hover:translate-x-[-4px] transition-transform">
            <ChevronRight className="rotate-180" size={14} /> Back to standard reports
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
               <TableIcon size={20} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">General Ledger</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-brand-emerald text-brand-emerald text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-emerald/5 transition-all">
            <Settings2 size={16} /> Customize
          </button>
          <button className="px-5 py-2 bg-brand-emerald text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all">
            Save As
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative group mb-6"
      >
        <div className="glass-morphism rounded-[32px] border border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
            className="flex flex-col lg:flex-row items-stretch"
          >
            {/* Metric 1 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              className="flex-1 p-8 lg:px-10 lg:py-8 transition-all hover:bg-white/40 group/item cursor-default relative"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Combined Cash Balance</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">$98,229.29</h3>
                <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/5 px-2 py-0.5 rounded shadow-sm border border-brand-emerald-100/50 uppercase tracking-widest">VERIFIED</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Ledger Liquidity</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>

            <div className="hidden lg:block w-px bg-slate-200/60 my-6" />

            {/* Metric 2 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              className="flex-1 p-8 lg:px-10 lg:py-8 transition-all hover:bg-white/40 group/item cursor-default relative"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Daily Flow Avg</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">$3,120</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded border border-slate-100 italic">30D AVG</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Asset Movement</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>

            <div className="hidden lg:block w-px bg-slate-200/60 my-6" />

            {/* Metric 3 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              className="flex-1 p-8 lg:px-10 lg:py-8 transition-all hover:bg-white/40 group/item cursor-default border-t lg:border-t-0 border-slate-100 relative"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Sync Status</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">LIVE</h3>
                <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 bg-brand-emerald/5 rounded border border-brand-emerald-100/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
                  HEALTHY
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Real-time Continuity</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Bar - QuickBooks Style */}
      <div className="bg-white border text-slate-900 border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-wrap items-end gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Period</label>
          <div className="relative">
            <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold outline-none focus:border-brand-emerald transition-all">
              <option>Last month</option>
              <option>This quarter</option>
              <option>This fiscal year</option>
              <option>Custom</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm font-bold outline-none focus:border-brand-emerald transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm font-bold outline-none focus:border-brand-emerald transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounting Method</label>
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button 
              onClick={() => setAccountingMethod('Cash')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${accountingMethod === 'Cash' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cash
            </button>
            <button 
              onClick={() => setAccountingMethod('Accrual')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${accountingMethod === 'Accrual' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Accrual
            </button>
          </div>
        </div>

        <div className="flex-1" />

        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
          Run Report
        </button>
      </div>

      {/* Main Report Board */}
      <div className="bg-white border text-slate-900 border-slate-200 rounded-[32px] overflow-hidden shadow-xl flex flex-col min-h-[600px]">
        {/* Report Toolbar */}
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="relative">
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none transition-all pr-8 appearance-none"
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as any)}
                >
                  <option>Standard</option>
                  <option>Compact</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Mail size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Printer size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={18} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={18} /></button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] p-12 flex flex-col items-center">
            {/* Report Identity */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">General Ledger</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Willard Finance Solutions LLC</p>
              <p className="text-sm font-medium text-slate-400 mt-1">April 2026</p>
            </div>

            {/* Structured Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y border-slate-200">
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Account & Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Num</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Split</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                </tr>
              </thead>
              <tbody>
                {mockGroups.map((group) => {
                   let runningBalance = group.beginningBalance;
                   const isExpanded = expandedGroups.has(group.id);

                   return (
                     <React.Fragment key={group.id}>
                       {/* Group Header Row */}
                       <tr 
                         onClick={() => toggleGroup(group.id)}
                         className="bg-slate-50 border-b border-slate-100 cursor-pointer group hover:bg-slate-100 transition-colors"
                       >
                         <td colSpan={8} className="px-4 py-3">
                           <div className="flex items-center gap-2">
                             {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                               {group.accountCode} {group.accountName} ({group.transactions.length})
                             </span>
                           </div>
                         </td>
                       </tr>

                       {/* Group Content */}
                       {isExpanded && (
                         <>
                           {/* Beginning Balance Row */}
                           <tr className="border-b border-slate-50 italic">
                             <td className="px-8 py-3 text-xs font-medium text-slate-400" colSpan={7}>Beginning Balance</td>
                             <td className="px-4 py-3 text-right text-xs font-bold text-slate-500 font-mono">
                               {group.beginningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                           </tr>

                           {/* Transactions */}
                           {group.transactions.map((t) => {
                             runningBalance += t.amount;
                             return (
                               <tr key={t.id} className="border-b border-slate-50 hover:bg-brand-emerald/[0.02] transition-colors group">
                                 <td className="px-8 py-3 text-xs font-medium text-slate-600">{format(new Date(t.date), 'MM/dd/yyyy')}</td>
                                 <td className="px-4 py-3 text-xs font-medium text-slate-600">{t.type}</td>
                                 <td className="px-4 py-3 text-xs font-medium text-slate-600">{t.num}</td>
                                 <td className="px-4 py-3 text-xs font-medium text-slate-600 truncate max-w-[150px]">{t.name}</td>
                                 <td className="px-4 py-3 text-xs font-medium text-slate-400 leading-relaxed truncate max-w-[200px]">{t.description}</td>
                                 <td className="px-4 py-3 text-xs font-medium text-slate-400">{t.split}</td>
                                 <td className="px-4 py-3 text-right text-xs font-bold text-slate-900 font-mono whitespace-nowrap">
                                   {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </td>
                                 <td className="px-4 py-3 text-right text-xs font-bold text-slate-500 font-mono whitespace-nowrap">
                                   {runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </td>
                               </tr>
                             );
                           })}

                           {/* Group Total Row */}
                           <tr className="bg-slate-50/50 border-b-2 border-slate-200">
                             <td colSpan={6} className="px-4 py-4 text-xs font-black text-slate-900 uppercase tracking-widest text-right">
                               Total for {group.accountName}
                             </td>
                             <td className="px-4 py-4 text-right text-xs font-black text-brand-emerald font-mono">
                               $ {group.transactions.reduce((s, t) => s + t.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                             <td className="px-4 py-4 text-right text-xs font-black text-slate-900 font-mono">
                               $ {runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                           </tr>
                         </>
                       )}
                     </React.Fragment>
                   );
                })}
              </tbody>

              {/* Report Grand Total */}
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td colSpan={7} className="px-4 py-5 text-sm font-black uppercase tracking-[0.2em] text-right">
                    Net Movement / Balance
                  </td>
                  <td className="px-4 py-5 text-right text-sm font-black font-mono">
                    $ {mockGroups.reduce((acc, g) => acc + g.beginningBalance + g.transactions.reduce((s, t) => s + t.amount, 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer Disclaimer */}
            <div className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-slate-100" />
              This report is for internal management use only
              <div className="w-12 h-px bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
