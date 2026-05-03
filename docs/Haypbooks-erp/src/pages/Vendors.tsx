import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight,
  User,
  ShieldCheck,
  AlertCircle,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  History,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import CreateVendorForm from '../components/CreateVendorForm';

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Under Review' | 'Secondary' | 'Inactive';
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  mtdSpend: number;
  health: 'Healthy' | 'Warning' | 'Critical';
  lastActivity: string;
}

const mockVendors: Vendor[] = [
  {
    id: 'V-2024-001',
    name: 'Amazon Web Services',
    category: 'Cloud Services',
    status: 'Active',
    contact: { name: 'Sarah Miller', email: 's.miller@aws.com', phone: '+1 555-0123' },
    mtdSpend: 12450.00,
    health: 'Healthy',
    lastActivity: '2h ago'
  },
  {
    id: 'V-2024-002',
    name: 'Office Depot',
    category: 'Supplies',
    status: 'Secondary',
    contact: { name: 'Michael Chen', email: 'mchen@officedepot.com', phone: '+1 555-0456' },
    mtdSpend: 1205.40,
    health: 'Healthy',
    lastActivity: '1d ago'
  },
  {
    id: 'V-2024-003',
    name: 'LegalShield',
    category: 'Legal',
    status: 'Under Review',
    contact: { name: 'David Wilson', email: 'd.wilson@legalshield.com', phone: '+1 555-0789' },
    mtdSpend: 3500.00,
    health: 'Warning',
    lastActivity: '5h ago'
  },
  {
    id: 'V-2024-004',
    name: 'Green Energy Corp',
    category: 'Utilities',
    status: 'Active',
    contact: { name: 'Emma Davis', email: 'edavis@greenenergy.com', phone: '+1 555-0321' },
    mtdSpend: 4200.15,
    health: 'Healthy',
    lastActivity: '3d ago'
  },
  {
    id: 'V-2024-005',
    name: 'FedEx Express',
    category: 'Logistics',
    status: 'Active',
    contact: { name: 'Robert King', email: 'rking@fedex.com', phone: '+1 555-0654' },
    mtdSpend: 850.30,
    health: 'Healthy',
    lastActivity: '1h ago'
  }
];

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [anyColumnResized, setAnyColumnResized] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState([
    { id: 'name', label: 'Vendor Name', width: 280, visible: true },
    { id: 'category', label: 'Category', width: 180, visible: true },
    { id: 'status', label: 'Status', width: 160, visible: true },
    { id: 'contact', label: 'Contact Info', width: 240, visible: true },
    { id: 'mtdSpend', label: 'MTD Spend', width: 160, visible: true },
    { id: 'health', label: 'Health', width: 140, visible: true },
    { id: 'lastActivity', label: 'Last Activity', width: 140, visible: true },
  ]);

  const categories = ['All', ...new Set(mockVendors.map(v => v.category))];

  const filteredVendors = useMemo(() => {
    return mockVendors.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const totalTableWidth = useMemo(() => {
    const selectionColWidth = 64; // w-16
    const actionWidth = 64; // w-16
    return columns.filter(c => c.visible).reduce((acc, col) => acc + col.width, 0) + actionWidth + selectionColWidth;
  }, [columns]);

  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
    setAnyColumnResized(true);
  };

  useEffect(() => {
    if (!resizingColumn) return;

    let frameId: number;
    const onMouseMove = (e: MouseEvent) => {
      frameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        setColumns(prev => prev.map(col => 
          col.id === resizingColumn 
            ? { ...col, width: Math.max(100, startWidth + deltaX) } 
            : col
        ));
      });
    };

    const onMouseUp = () => setResizingColumn(null);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  const toggleSelectAll = () => {
    if (selectedVendors.size === filteredVendors.length) {
      setSelectedVendors(new Set());
    } else {
      setSelectedVendors(new Set(filteredVendors.map(v => v.id)));
    }
  };

  const toggleSelectVendor = (id: string) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVendors(newSelected);
  };

  const getStatusStyle = (status: Vendor['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Secondary': return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'Inactive': return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  const getHealthIcon = (health: Vendor['health']) => {
    switch (health) {
      case 'Healthy': return <ShieldCheck size={14} className="text-emerald-500" />;
      case 'Warning': return <AlertCircle size={14} className="text-amber-500" />;
      case 'Critical': return <AlertCircle size={14} className="text-rose-500" />;
    }
  };

  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-brand-emerald/10 rounded-xl">
              <Building2 size={20} className="text-brand-emerald-dark" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vendor Management</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl">
            Streamline your supply chain operations, monitor critical vendor health, and manage executive partnerships in one unified workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Export Portfolio
          </button>
          <button 
            onClick={() => setIsNewVendorModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            New Vendor
          </button>
        </div>
      </div>

      {/* Strategic Intelligence Ribbon */}
      <div className="glass-morphism rounded-[32px] border border-slate-200/50 shadow-xl shadow-brand-emerald/5 overflow-hidden bg-white/40 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-stretch">
          {[
            { label: 'Portfolio Value', value: '$412,850', trend: '+8.4%', icon: ArrowUpRight, desc: 'Portfolio Spend', color: 'emerald' },
            { label: 'Active Partnerships', value: '142', trend: '+4', icon: ArrowUpRight, desc: 'Active Contracts', color: 'blue' },
            { label: 'Compliance Health', value: '98.2%', trend: '-0.2%', icon: ArrowDownRight, desc: 'Risk Assessment', color: 'amber' }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex-1 p-8 relative group transition-colors hover:bg-white/50 ${i !== 2 ? 'border-r border-slate-200/50' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${metric.color === 'emerald' ? 'bg-emerald-500' : metric.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{metric.label}</span>
                  </div>
                  <metric.icon size={14} className={`${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{metric.value}</h3>
                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${metric.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {metric.trend}
                  </div>
                </div>
                
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-60">
                  {metric.desc}
                </p>
              </div>

              {/* Decorative background number/shape */}
              <div className="absolute right-4 bottom-4 text-slate-100/50 text-6xl font-black select-none pointer-events-none group-hover:text-brand-emerald/10 transition-colors">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Experience: Control Center */}
      <div className="glass-morphism rounded-[40px] border border-slate-200/50 shadow-xl overflow-hidden bg-white/40 flex flex-col min-h-[600px]" ref={tableContainerRef}>
        {/* Toolbar */}
        <div className="px-8 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-emerald transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search vendor intelligence..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-brand-emerald/40 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    cat === activeCategory 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-brand-emerald/30 transition-all shadow-sm">
              <Filter size={18} />
            </button>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-brand-emerald/30 transition-all shadow-sm">
              <History size={18} />
            </button>
          </div>
        </div>

        {/* Bulk Action Strip */}
        <AnimatePresence>
          {selectedVendors.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <span className="text-white text-xs font-black bg-brand-emerald/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                  {selectedVendors.size} Vendors Selected
                </span>
                <div className="flex items-center gap-2">
                  <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
                    <Mail size={14} /> Send Inquiry
                  </button>
                  <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
                    <Download size={14} /> Export Specs
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendors(new Set())}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors"
              >
                Clear Selection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intelligence Table */}
        <div className="overflow-auto custom-scrollbar w-full flex-1 bg-white relative">
          <div className="flex flex-col" style={{ 
            width: anyColumnResized ? `${totalTableWidth}px` : '100%',
            minWidth: '100%' 
          }}>
            {/* Table Header */}
            <div className="border-b border-slate-200/60 bg-white flex select-none sticky top-0 z-40 min-w-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
              {/* Selection Column Header */}
              <div className="w-16 flex items-center justify-center border-r border-slate-200/50 shrink-0 bg-white">
                <label className="relative flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={selectedVendors.size === filteredVendors.length && filteredVendors.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedVendors.size === filteredVendors.length && filteredVendors.length > 0 ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-300'}`}>
                    {selectedVendors.size === filteredVendors.length && filteredVendors.length > 0 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                  </div>
                </label>
              </div>

              <Reorder.Group axis="x" values={columns} onReorder={setColumns} className="flex flex-1">
                {columns.filter(c => c.visible).map((column) => (
                  <Reorder.Item 
                    key={column.id} 
                    value={column}
                    transition={resizingColumn ? { duration: 0 } : undefined}
                    className="relative group border-r border-slate-200/50 bg-white"
                    style={{ 
                      width: anyColumnResized ? column.width : 'auto', 
                      flex: anyColumnResized ? `0 0 ${column.width}px` : `1 1 0%`, 
                      minWidth: 100 
                    }}
                  >
                    <div className={`h-full px-6 py-5 flex items-center justify-between cursor-pointer transition-colors ${resizingColumn ? '' : 'hover:bg-slate-50'}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{column.label}</span>
                      <ChevronDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Resizer */}
                    <div 
                      onMouseDown={(e) => handleResizeStart(e, column.id, column.width)}
                      className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-brand-emerald/30 transition-colors z-50 ${resizingColumn === column.id ? 'bg-brand-emerald w-0.5' : ''}`}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              <div className="w-16 bg-white shrink-0 sticky right-0 z-40" />
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100 min-w-full">
              <AnimatePresence>
                {filteredVendors.map((vendor, vIdx) => (
                  <motion.div
                    key={vendor.id}
                    layout={!resizingColumn}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={resizingColumn ? { duration: 0 } : { duration: 0.3, delay: vIdx * 0.05 }}
                    className={`flex min-w-full group bg-white border-b border-slate-100 last:border-b-0 relative ${resizingColumn ? '' : 'hover:bg-slate-50 transition-colors'} ${selectedVendors.has(vendor.id) ? 'bg-brand-emerald/[0.04]' : ''}`}
                  >
                    {/* Selection Column Row */}
                    <div className="w-16 flex items-center justify-center border-r border-slate-200/50 shrink-0 bg-white/50">
                      <label className="relative flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={selectedVendors.has(vendor.id)}
                          onChange={() => toggleSelectVendor(vendor.id)}
                        />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedVendors.has(vendor.id) ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-200'}`}>
                          {selectedVendors.has(vendor.id) && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                        </div>
                      </label>
                    </div>

                    {columns.filter(c => c.visible).map((col) => (
                      <div 
                        key={`${vendor.id}-${col.id}`}
                        className={`px-6 py-5 flex items-center min-w-0 border-r border-slate-100/50 ${resizingColumn ? '' : 'transition-colors'}`}
                        style={{ 
                          width: anyColumnResized ? col.width : 'auto', 
                          flex: anyColumnResized ? `0 0 ${col.width}px` : `1 1 0%`,
                          minWidth: 100
                        }}
                      >
                        {col.id === 'name' && (
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:border-brand-emerald/30 transition-all">
                              <Building2 size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{vendor.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{vendor.id}</p>
                            </div>
                          </div>
                        )}
                        {col.id === 'category' && (
                          <div className="flex items-center gap-2">
                             <Tag size={12} className="text-slate-300" />
                             <span className="text-sm font-medium text-slate-600">{vendor.category}</span>
                          </div>
                        )}
                        {col.id === 'status' && (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        )}
                        {col.id === 'contact' && (
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <User size={12} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-700 truncate">{vendor.contact.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail size={12} className="text-slate-300" />
                              <Phone size={12} className="text-slate-300" />
                              <span className="text-[10px] text-slate-400 font-medium truncate">{vendor.contact.email}</span>
                            </div>
                          </div>
                        )}
                        {col.id === 'mtdSpend' && (
                          <span className="text-sm font-black text-slate-900 tracking-tight">
                            ${vendor.mtdSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {col.id === 'health' && (
                          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
                            vendor.health === 'Healthy' ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700' :
                            vendor.health === 'Warning' ? 'bg-amber-50/50 border-amber-100/50 text-amber-700' :
                            'bg-rose-50/50 border-rose-100/50 text-rose-700'
                          }`}>
                            {getHealthIcon(vendor.health)}
                            <span className="text-[10px] font-bold">{vendor.health}</span>
                          </div>
                        )}
                        {col.id === 'lastActivity' && (
                          <span className="text-xs font-medium text-slate-500 italic">{vendor.lastActivity}</span>
                        )}
                      </div>
                    ))}

                    <div className="w-16 flex items-center justify-center bg-white group-hover:bg-slate-50 transition-colors sticky right-0 z-30 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
                      <div className="relative group/menu">
                        <button className="p-2 text-slate-400 hover:text-brand-emerald transition-all hover:scale-110 rounded-lg outline-none cursor-pointer">
                          <MoreHorizontal size={18} />
                        </button>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-50 transform origin-right scale-90 group-hover/menu:scale-100 overflow-hidden">
                          <div className="px-4 py-2 mb-1 border-b border-slate-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Management</p>
                          </div>
                          {[
                            { label: 'View Analytics', icon: ArrowUpRight },
                            { label: 'Contact Vendor', icon: Mail },
                            { label: 'View Documents', icon: FileText },
                            { label: 'Compliance Hub', icon: ShieldCheck },
                            { label: 'Vendor Site', icon: ExternalLink },
                          ].map((action, i) => (
                            <button key={i} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center justify-between transition-colors">
                              {action.label}
                              <action.icon size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200/60 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">
            Scanning <span className="text-slate-900 font-bold">{filteredVendors.length}</span> active intelligence profile{filteredVendors.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${p === 1 ? 'bg-brand-emerald text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CreateVendorForm 
        isOpen={isNewVendorModalOpen} 
        onClose={() => setIsNewVendorModalOpen(false)} 
      />
    </div>
  );
}
