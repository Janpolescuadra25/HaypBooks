import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Info, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Calendar,
  Save,
  FileText,
  History,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface JournalLine {
  id: string;
  account: string;
  debit: string;
  credit: string;
  description: string;
  name: string;
}

interface CreateJournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyLine = (): JournalLine => ({
  id: Math.random().toString(36).substr(2, 9),
  account: '',
  debit: '',
  credit: '',
  description: '',
  name: ''
});

export default function CreateJournalEntryForm({ isOpen, onClose }: CreateJournalEntryFormProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [journalNo, setJournalNo] = useState('JE-2024-001');
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
  
  const totalDebits = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const outOfBalance = Math.abs(totalDebits - totalCredits) > 0.001;

  const handleAddLine = () => setLines([...lines, emptyLine()]);
  
  const handleRemoveLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(l => l.id !== id));
    } else {
      // Clear line if only 2 left (minimum)
      setLines(lines.map(l => l.id === id ? emptyLine() : l));
    }
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        // If updating debit, clear credit and vice versa
        if (field === 'debit' && value !== '') return { ...l, [field]: value, credit: '' };
        if (field === 'credit' && value !== '') return { ...l, [field]: value, debit: '' };
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-[95vw] max-w-[1280px] h-[90vh] bg-white rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-emerald flex items-center justify-center text-white">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Journal Entry</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity:</span>
                  <span className="text-[10px] font-black text-brand-emerald-dark uppercase tracking-widest bg-brand-emerald/10 px-2 py-0.5 rounded">Tech Corp USA</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                <History size={16} /> Recurring
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <Settings2 size={20} />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {/* Top Row Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Journal Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-emerald transition-colors" size={16} />
                  <input 
                    type="date"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-brand-emerald/40 outline-none transition-all shadow-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Journal No.</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-brand-emerald/40 outline-none transition-all shadow-sm"
                  value={journalNo}
                  onChange={(e) => setJournalNo(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex flex-col justify-end pb-3 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Drafting Adjustment</span>
                </div>
              </div>
            </div>

            {/* Grid Table */}
            <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-slate-50/20 shadow-sm mb-12">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="w-12 px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Account *</th>
                    <th className="w-40 px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debits</th>
                    <th className="w-40 px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Credits</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (Entity)</th>
                    <th className="w-16 px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="border-b border-slate-50 group hover:bg-brand-emerald/[0.01]">
                      <td className="px-4 py-2 text-center text-[10px] font-bold text-slate-300">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <div className="relative">
                          <select 
                            className="w-full px-3 py-2.5 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-brand-emerald outline-none text-sm font-bold transition-all appearance-none pr-8"
                            value={line.account}
                            onChange={(e) => updateLine(line.id, 'account', e.target.value)}
                          >
                            <option value="">Select Account</option>
                            <optgroup label="Assets">
                              <option>1010 - Cash on Hand</option>
                              <option>1200 - Accounts Receivable</option>
                              <option>1500 - Fixed Assets</option>
                            </optgroup>
                            <optgroup label="Liabilities">
                              <option>2000 - Accounts Payable</option>
                              <option>2100 - Payroll Liabilities</option>
                            </optgroup>
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                         <input 
                           type="number"
                           placeholder="0.00"
                           className="w-full px-3 py-2.5 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-brand-emerald outline-none text-sm font-bold text-right transition-all"
                           value={line.debit}
                           onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                         />
                      </td>
                      <td className="px-4 py-2">
                         <input 
                           type="number"
                           placeholder="0.00"
                           className="w-full px-3 py-2.5 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-brand-emerald outline-none text-sm font-bold text-right transition-all"
                           value={line.credit}
                           onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                         />
                      </td>
                      <td className="px-4 py-2">
                         <input 
                           type="text"
                           placeholder="Describe the entry..."
                           className="w-full px-3 py-2.5 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-brand-emerald outline-none text-sm font-medium transition-all"
                           value={line.description}
                           onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                         />
                      </td>
                      <td className="px-4 py-2">
                         <input 
                           type="text"
                           placeholder="Customer or Vendor"
                           className="w-full px-3 py-2.5 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-brand-emerald outline-none text-sm font-medium transition-all"
                           value={line.name}
                           onChange={(e) => updateLine(line.id, 'name', e.target.value)}
                         />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/30">
                    <td colSpan={2} className="px-8 py-4">
                      <button 
                        onClick={handleAddLine}
                        className="flex items-center gap-2 text-xs font-black text-brand-emerald uppercase tracking-widest hover:text-brand-emerald-dark transition-colors"
                      >
                        <Plus size={16} /> Add Lines
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debit</p>
                      <p className="text-sm font-black text-slate-900 font-mono">${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-4 py-4 text-right border-r border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credit</p>
                      <p className="text-sm font-black text-slate-900 font-mono">${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td colSpan={3} className="px-8 py-4">
                      {outOfBalance && (
                        <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                          <AlertCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Manual Journal is out of balance</span>
                        </div>
                      )}
                      {!outOfBalance && totalDebits > 0 && (
                        <div className="flex items-center gap-2 text-brand-emerald">
                          <HelpCircle size={16} className="opacity-40" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Entry is balanced</span>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Memo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
               <div className="space-y-4">
                 <div className="space-y-1.5 pt-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Journal Global Memo</label>
                   <textarea 
                     placeholder="Add a remark for the whole journal entry..."
                     rows={4}
                     className="w-full p-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:border-brand-emerald/40 outline-none transition-all shadow-sm resize-none"
                     value={memo}
                     onChange={(e) => setMemo(e.target.value)}
                   />
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 italic text-[10px] ml-2">
                    <Info size={12} />
                    Auto-save enabled. Drafts are kept for 30 days.
                 </div>
               </div>

               <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Audit Summary</h3>
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Total Adjustments</span>
                      <span className="font-bold text-slate-700">{lines.filter(l => l.account).length} Accounts</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Balanced Status</span>
                      <span className={`font-bold ${outOfBalance ? 'text-rose-500' : 'text-brand-emerald'}`}>
                        {outOfBalance ? 'Unbalanced' : 'Validated'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Net Change</span>
                      <span className="text-sm font-black text-brand-emerald-dark font-mono">$0.00</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel Transaction
            </button>
            <div className="flex items-center gap-3">
               <button className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Save and new</button>
               <button 
                disabled={outOfBalance || totalDebits === 0}
                onClick={onClose}
                className={`flex items-center gap-3 px-12 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
                  outOfBalance || totalDebits === 0
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   : 'bg-brand-emerald text-white shadow-brand-emerald/20 hover:scale-105 active:scale-95'
                }`}
              >
                Post Entry
                <Save size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
