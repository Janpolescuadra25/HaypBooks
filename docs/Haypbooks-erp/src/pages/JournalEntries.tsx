import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  Download, 
  Printer, 
  Trash2, 
  Edit3, 
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  Mail,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CreateJournalEntryForm from '../components/CreateJournalEntryForm';

interface JournalEntry {
  id: string;
  date: string;
  journalNo: string;
  memo: string;
  amount: number;
  status: 'Posted' | 'Draft' | 'Reversed';
  createdBy: string;
}

const mockJournalEntries: JournalEntry[] = [
  { id: '1', date: '2024-05-01', journalNo: 'JE-0001', memo: 'Monthly Office Rent Allocation', amount: 4500, status: 'Posted', createdBy: 'John Paul' },
  { id: '2', date: '2024-04-28', journalNo: 'JE-0002', memo: 'Prepaid Insurance Adjustment', amount: 1200, status: 'Posted', createdBy: 'Sarah Doe' },
  { id: '3', date: '2024-04-25', journalNo: 'JE-0003', memo: 'Equipment Depreciation - Q1', amount: 8500, status: 'Posted', createdBy: 'John Paul' },
  { id: '4', date: '2024-04-20', journalNo: 'JE-0004', memo: 'Loan Interest Accrual', amount: 350, status: 'Draft', createdBy: 'Michael Chen' },
  { id: '5', date: '2024-04-15', journalNo: 'JE-1029', memo: 'Correction of Sales Record INV-202', amount: 2100, status: 'Posted', createdBy: 'John Paul' },
];

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const filteredEntries = useMemo(() => {
    return mockJournalEntries.filter(entry => 
      entry.journalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.memo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
    }
  };

  const toggleEntry = (id: string) => {
    const next = new Set(selectedEntries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEntries(next);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-emerald text-xs font-black uppercase tracking-[0.2em] mb-2">
            <Layers size={14} />
            General Ledger
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Journal Entries
          </h1>
          <p className="text-slate-400 font-medium mt-1">Manual adjustments and recurring ledger entries.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">
            <Printer size={18} />
            Print Log
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-emerald text-white rounded-2xl text-sm font-black shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={18} />
            New Journal Entry
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Total Reconciled</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">$18,350.00</h3>
                <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/5 px-2 py-0.5 rounded shadow-sm border border-brand-emerald-100/50">MTD</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Verified Assets</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>

            <div className="hidden lg:block w-px bg-slate-200/60 my-6" />

            {/* Metric 2 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              className="flex-1 p-8 lg:px-10 lg:py-8 transition-all hover:bg-white/40 group/item cursor-default relative"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Open Drafts</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">0</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded border border-slate-100">BALANCED</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Ledger Status</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>

            <div className="hidden lg:block w-px bg-slate-200/60 my-6" />

            {/* Metric 3 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              className="flex-1 p-8 lg:px-10 lg:py-8 transition-all hover:bg-white/40 group/item cursor-default border-t lg:border-t-0 border-slate-100 relative"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Audit Queue</span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">1</h3>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">REVIEW REQ</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60 group-hover/item:text-brand-emerald transition-colors">Compliance Check</p>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-emerald w-0 group-hover/item:w-full transition-all duration-500" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Table Container */}
      <div className="glass-morphism rounded-[40px] border border-slate-200/50 shadow-xl overflow-hidden bg-white/40 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="px-8 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-emerald transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search Journal No or Memo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:border-brand-emerald/30 focus:ring-4 focus:ring-brand-emerald/5 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200">
              <Filter size={20} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button className="flex items-center gap-2 px-4 py-2 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-900">
              Export <Download size={16} />
            </button>
          </div>
        </div>

        {/* Bulk Action Strip */}
        <AnimatePresence>
          {selectedEntries.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <span className="text-white text-xs font-black bg-brand-emerald/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                  {selectedEntries.size} Entries Selected
                </span>
                <div className="flex items-center gap-2">
                  <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
                    <Trash2 size={14} /> Batch Delete
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEntries(new Set())}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60 sticky top-0 z-10 backdrop-blur-sm">
                <th className="w-16 px-6 py-5">
                  <label className="relative flex items-center cursor-pointer justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={selectedEntries.size === filteredEntries.length && filteredEntries.length > 0}
                      onChange={toggleSelectAll}
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedEntries.size === filteredEntries.length && filteredEntries.length > 0 ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-300'}`}>
                      {selectedEntries.size === filteredEntries.length && filteredEntries.length > 0 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                    </div>
                  </label>
                </th>
                {[
                  { label: 'Date', icon: Calendar },
                  { label: 'Journal No', icon: Layers },
                  { label: 'Memo', icon: FileText },
                  { label: 'Amount', icon: ArrowUpDown },
                  { label: 'Status', icon: CheckCircle2 },
                  { label: 'Created By', icon: Users },
                ].map((header, i) => (
                  <th key={i} className="px-6 py-5 text-left group">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{header.label}</span>
                      <header.icon size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5" />
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, idx) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors group ${selectedEntries.has(entry.id) ? 'bg-brand-emerald/[0.03]' : ''}`}
                >
                  <td className="px-6 py-5">
                    <label className="relative flex items-center cursor-pointer justify-center">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => toggleEntry(entry.id)}
                      />
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedEntries.has(entry.id) ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-200'}`}>
                        {selectedEntries.has(entry.id) && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                      </div>
                    </label>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">{entry.date}</td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-900 group-hover:text-brand-emerald transition-colors">{entry.journalNo}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-400 italic max-w-xs truncate">{entry.memo}</td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ${entry.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      entry.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      entry.status === 'Draft' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                         {entry.createdBy.split(' ').map(n => n[0]).join('')}
                       </div>
                       <span className="text-xs font-bold text-slate-600">{entry.createdBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateJournalEntryForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
