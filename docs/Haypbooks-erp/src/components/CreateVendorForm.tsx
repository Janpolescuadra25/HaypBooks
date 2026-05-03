import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Info,
  CreditCard,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface CreateVendorFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateVendorForm({ isOpen, onClose }: CreateVendorFormProps) {
  const [activeTab, setActiveTab] = useState<'Address' | 'Notes' | 'Payments' | 'Taxes'>('Address');
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    company: '',
    displayName: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    billingAddress: '',
    shippingAddress: '',
    notes: '',
    accountNumber: '',
    terms: 'Net 30',
    openingBalance: '0.00',
    asOfDate: format(new Date(), 'yyyy-MM-dd'),
    taxId: '',
    track1099: false,
    billingSameAsShipping: true
  });

  const categories = ['Software', 'Hardware', 'Legal', 'Marketing', 'Logistics', 'Supplies', 'Utilities'];
  const pTerms = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 60', 'Net 90'];

  const handleClose = () => {
    setActiveTab('Address');
    onClose();
  };

  // Sync display name if not manually edited
  const updateDisplayName = (first: string, last: string, company: string) => {
    if (company) setFormData(prev => ({ ...prev, displayName: company }));
    else if (first || last) setFormData(prev => ({ ...prev, displayName: `${first} ${last}`.trim() }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-5xl bg-white rounded-[24px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Vendor Information</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Help</button>
              <button 
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({...formData, firstName: e.target.value});
                        updateDisplayName(e.target.value, formData.lastName, formData.company);
                      }}
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Middle</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({...formData, lastName: e.target.value});
                        updateDisplayName(formData.firstName, e.target.value, formData.company);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                    value={formData.company}
                    onChange={(e) => {
                      setFormData({...formData, company: e.target.value});
                      updateDisplayName(formData.firstName, formData.lastName, e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-1 bg-brand-emerald/5 p-4 rounded-xl border border-brand-emerald/10">
                  <label className="text-[10px] font-black text-brand-emerald-dark uppercase tracking-widest">Display name as *</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  />
                  <p className="text-[9px] text-slate-400 font-medium">This is how the vendor will appear in your lists and transactions.</p>
                </div>
              </div>

              {/* Right Column: Contact Detail */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="email" 
                        placeholder="example@acme.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Website</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="https://..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Fax</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                      value={formData.fax}
                      onChange={(e) => setFormData({...formData, fax: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Interface */}
            <div className="mt-12 border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-slate-50/30">
              <div className="flex border-b border-slate-100 bg-white px-2">
                {(['Address', 'Notes', 'Payments', 'Taxes'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-brand-emerald' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTabVendor"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-emerald rounded-t-full" 
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'Address' && (
                    <motion.div 
                      key="address-tab"
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-900 block">Billing Address</label>
                        <textarea 
                          rows={4} 
                          className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all resize-none shadow-inner"
                          placeholder="Street, City, State, ZIP..."
                          value={formData.billingAddress}
                          onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-900">Shipping Address</label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${formData.billingSameAsShipping ? 'bg-brand-emerald border-brand-emerald' : 'border-slate-300 group-hover:border-slate-400'}`}>
                               <input 
                                 type="checkbox" 
                                 className="sr-only" 
                                 checked={formData.billingSameAsShipping}
                                 onChange={(e) => setFormData({...formData, billingSameAsShipping: e.target.checked})}
                               />
                               {formData.billingSameAsShipping && <div className="w-2 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Same as billing</span>
                          </label>
                        </div>
                        <textarea 
                          rows={4} 
                          className={`w-full p-4 bg-white border border-slate-200 rounded-xl text-sm transition-all resize-none shadow-inner ${formData.billingSameAsShipping ? 'opacity-40 pointer-events-none bg-slate-50' : 'focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none'}`}
                          placeholder="Street, City, State, ZIP..."
                          value={formData.billingSameAsShipping ? formData.billingAddress : formData.shippingAddress}
                          onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'Notes' && (
                    <motion.div 
                       key="notes-tab"
                       initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    >
                      <label className="text-xs font-bold text-slate-900 block mb-4">Internal Notes</label>
                      <textarea 
                        rows={8} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all resize-none shadow-inner"
                        placeholder="Add private information about this vendor..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'Payments' && (
                    <motion.div 
                       key="payments-tab"
                       initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                       className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-brand-emerald outline-none shadow-sm"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms</label>
                          <div className="relative">
                            <select 
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold appearance-none outline-none focus:border-brand-emerald shadow-sm"
                              value={formData.terms}
                              onChange={(e) => setFormData({...formData, terms: e.target.value})}
                            >
                              {pTerms.map(term => <option key={term} value={term}>{term}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                            <input 
                              type="number" 
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-brand-emerald outline-none shadow-sm"
                              value={formData.openingBalance}
                              onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">As of Date</label>
                          <input 
                            type="date" 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-brand-emerald outline-none shadow-sm"
                            value={formData.asOfDate}
                            onChange={(e) => setFormData({...formData, asOfDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'Taxes' && (
                    <motion.div 
                       key="taxes-tab"
                       initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                       className="space-y-8"
                    >
                      <div className="max-w-md space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Tax ID / Social Security (TIN)</label>
                          <input 
                            type="text" 
                            placeholder="XX-XXXXXXX"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-brand-emerald outline-none shadow-sm"
                            value={formData.taxId}
                            onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                          />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-brand-emerald/30 transition-all">
                           <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${formData.track1099 ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'border-slate-300'}`}>
                             <input 
                               type="checkbox" 
                               className="sr-only" 
                               checked={formData.track1099}
                               onChange={(e) => setFormData({...formData, track1099: e.target.checked})}
                             />
                             {formData.track1099 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                           </div>
                           <span className="text-sm font-bold text-slate-700">Track payments for 1099</span>
                        </label>
                      </div>

                      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 flex gap-4 max-w-2xl">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-amber-900">Accountancy Compliance</p>
                          <p className="text-xs text-amber-600/80 font-medium leading-relaxed">Tax identification is required for year-end reporting. Businesses that pay an independent contractor $600 or more during a tax year are generally required to report such payments to the IRS.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button 
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-widest rounded-xl"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
               <button className="px-6 py-2.5 text-sm font-bold text-slate-900 border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm">Save and new</button>
               <button 
                onClick={handleClose}
                className="px-10 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

