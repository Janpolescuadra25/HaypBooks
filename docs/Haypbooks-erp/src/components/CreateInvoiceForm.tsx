import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  User, 
  Hash, 
  FileText,
  CreditCard,
  ChevronDown,
  Info,
  Clock,
  GripVertical,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { Reorder, AnimatePresence } from 'motion/react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

interface CreateInvoiceFormProps {
  onClose: () => void;
  onSave: (invoice: any) => void;
}

export default function CreateInvoiceForm({ onClose, onSave }: CreateInvoiceFormProps) {
  const [customer, setCustomer] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-021`);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('Software');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, total: 0 }
  ]);
  const [notes, setNotes] = useState('');

  // Column Resizing State
  const [columnWidths, setColumnWidths] = useState({
    description: 0, // 0 means flex-grow
    quantity: 120,
    rate: 140,
    amount: 140
  });
  const [resizingColumn, setResizingColumn] = useState<keyof typeof columnWidths | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleResizeStart = (e: React.MouseEvent, column: keyof typeof columnWidths, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: Math.max(80, startWidth + deltaX)
      }));
    };

    const onMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, rate: 0, total: 0 }
    ]);
  };

  const copyItem = (id: string) => {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      const newItem = { 
        ...items[index], 
        id: Math.random().toString(36).substr(2, 9) 
      };
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      setItems(newItems);
    }
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.rate);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1; // 10%
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber,
      customer,
      createdDate: format(new Date(), 'yyyy-MM-dd'),
      billDate: issueDate,
      dueDate,
      amount: total,
      status: 'Draft',
      category
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 md:p-0"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full h-full md:h-[95vh] md:max-w-5xl bg-white md:rounded-t-[40px] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
            >
              <X size={20} />
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Invoice</h2>
              <p className="text-xs font-bold text-slate-400">Fill in the details below to generate a new invoice.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!customer}
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              <Save size={18} />
              Save Invoice
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <form className="max-w-4xl mx-auto space-y-12">
            
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Details</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Select or enter customer name"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-bold text-slate-900 transition-all placeholder:font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Invoice Number</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-bold text-slate-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-bold text-slate-900 transition-all appearance-none"
                      >
                        <option>Software</option>
                        <option>Hardware</option>
                        <option>Consulting</option>
                        <option>Services</option>
                        <option>Research</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Issue Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="date" 
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-bold text-slate-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Due Date</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-bold text-slate-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-brand-emerald/5 rounded-3xl border border-brand-emerald/10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald flex-shrink-0">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Automatic Reminders</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">We'll notify your customer 3 days before the due date and on the day it's overdue.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Line Items</label>
                <button 
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-brand-emerald-dark hover:bg-slate-50 transition-all"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                <div className="flex flex-col w-full">
                  {/* Header */}
                  <div className="bg-slate-50 border-b border-slate-100 flex items-center">
                    <div className="w-12 shrink-0 h-12" /> {/* Grip Column */}
                    <div className="flex-1 flex items-center h-12">
                      <div className="relative flex items-center h-full group" style={{ flex: '1 1 0%', minWidth: columnWidths.description || 200 }}>
                        <span className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                        <div 
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (rect) handleResizeStart(e, 'description', rect.width);
                          }}
                          className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-brand-emerald/30 transition-colors z-10 ${resizingColumn === 'description' ? 'bg-brand-emerald' : ''}`} 
                        />
                      </div>
                      <div className="relative flex items-center h-full group border-l border-slate-100/50" style={{ width: columnWidths.quantity }}>
                        <span className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</span>
                        <div 
                          onMouseDown={(e) => handleResizeStart(e, 'quantity', columnWidths.quantity)}
                          className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-brand-emerald/30 transition-colors z-10 ${resizingColumn === 'quantity' ? 'bg-brand-emerald' : ''}`} 
                        />
                      </div>
                      <div className="relative flex items-center h-full group border-l border-slate-100/50" style={{ width: columnWidths.rate }}>
                        <span className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                        <div 
                          onMouseDown={(e) => handleResizeStart(e, 'rate', columnWidths.rate)}
                          className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-brand-emerald/30 transition-colors z-10 ${resizingColumn === 'rate' ? 'bg-brand-emerald' : ''}`} 
                        />
                      </div>
                      <div className="relative flex items-center h-full group border-l border-slate-100/50" style={{ width: columnWidths.amount }}>
                        <span className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                        <div 
                          onMouseDown={(e) => handleResizeStart(e, 'amount', columnWidths.amount)}
                          className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-brand-emerald/30 transition-colors z-10 ${resizingColumn === 'amount' ? 'bg-brand-emerald' : ''}`} 
                        />
                      </div>
                    </div>
                    <div className="w-24 shrink-0 h-12" /> {/* Actions Column */}
                  </div>

                  {/* Body with Reorder */}
                  <div className="divide-y divide-slate-50">
                    <Reorder.Group axis="y" values={items} onReorder={setItems}>
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <Reorder.Item 
                            key={item.id} 
                            value={item}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center group hover:bg-slate-50/50 transition-colors bg-white relative"
                          >
                            <div className="w-12 flex items-center justify-center text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                              <GripVertical size={18} />
                            </div>
                            
                            <div className="flex-1 flex items-center min-h-[64px]">
                              <div className="px-6 py-4 h-full flex items-center" style={{ flex: '1 1 0%', minWidth: columnWidths.description || 200 }}>
                                <input 
                                  type="text" 
                                  placeholder="Service or product description"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  className="w-full bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300"
                                />
                              </div>
                              <div className="px-6 py-4 h-full flex items-center border-l border-slate-100/50" style={{ width: columnWidths.quantity }}>
                                <input 
                                  type="number" 
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent outline-none font-bold text-slate-900"
                                />
                              </div>
                              <div className="px-6 py-4 h-full flex items-center border-l border-slate-100/50" style={{ width: columnWidths.rate }}>
                                <div className="flex items-center gap-1 w-full">
                                  <span className="text-slate-300 font-bold">$</span>
                                  <input 
                                    type="number" 
                                    value={item.rate}
                                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-transparent outline-none font-bold text-slate-900"
                                  />
                                </div>
                              </div>
                              <div className="px-6 py-4 h-full flex items-center border-l border-slate-100/50" style={{ width: columnWidths.amount }}>
                                <span className="font-black text-slate-900 truncate">
                                  ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>

                            <div className="w-24 shrink-0 flex items-center justify-end gap-1 pr-4">
                              <button 
                                type="button"
                                onClick={() => copyItem(item.id)}
                                className="p-2 text-slate-300 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-lg transition-all"
                                title="Duplicate Row"
                              >
                                <Copy size={16} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Row"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </Reorder.Item>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="flex flex-col md:flex-row gap-12 pt-6">
              <div className="flex-1 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notes & Terms</label>
                <textarea 
                  placeholder="Appears at the bottom of the invoice..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none font-medium text-slate-600 transition-all resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="w-full md:w-80 space-y-4 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Subtotal</span>
                  <span className="font-black text-slate-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Tax (10%)</span>
                  <span className="font-black text-slate-900">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-black text-brand-emerald">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
