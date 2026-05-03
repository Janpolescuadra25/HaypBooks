import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GripVertical,
  ChevronDown,
  X,
  FileText,
  Mail,
  Printer,
  Trash2,
  Settings2,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Copy,
  Archive,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { format, isAfter, isBefore, isEqual, parseISO, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import DateRangePicker from '../components/DateRangePicker';

import CreateInvoiceForm from '../components/CreateInvoiceForm';

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Cancelled';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  createdDate: string;
  billDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  category: string;
}

interface Column {
  id: keyof Invoice;
  label: string;
  width: number;
  visible: boolean;
}

type FilterOperator = 'contains' | 'equals' | 'startsWith' | 'greaterThan' | 'lessThan' | 'before' | 'after' | 'between';

interface ColumnFilter {
  columnId: keyof Invoice;
  operator: FilterOperator;
  value: string;
  value2?: string; // For 'between'
}

const INITIAL_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001', customer: 'Acme Corp', createdDate: '2024-04-01', billDate: '2024-04-02', dueDate: '2024-05-01', amount: 12500.00, status: 'Paid', category: 'Software' },
  { id: '2', invoiceNumber: 'INV-2024-002', customer: 'Global Tech', createdDate: '2024-04-05', billDate: '2024-04-06', dueDate: '2024-05-06', amount: 8400.50, status: 'Pending', category: 'Hardware' },
  { id: '3', invoiceNumber: 'INV-2024-003', customer: 'Stark Ind.', createdDate: '2024-04-10', billDate: '2024-04-11', dueDate: '2024-04-20', amount: 45000.00, status: 'Overdue', category: 'Services' },
  { id: '4', invoiceNumber: 'INV-2024-004', customer: 'Wayne Ent.', createdDate: '2024-04-12', billDate: '2024-04-12', dueDate: '2024-05-12', amount: 2200.00, status: 'Paid', category: 'Software' },
  { id: '5', invoiceNumber: 'INV-2024-005', customer: 'Umbrella Co.', createdDate: '2024-04-15', billDate: '2024-04-16', dueDate: '2024-05-16', amount: 15600.75, status: 'Draft', category: 'Consulting' },
  { id: '6', invoiceNumber: 'INV-2024-006', customer: 'Cyberdyne', createdDate: '2024-04-18', billDate: '2024-04-19', dueDate: '2024-05-19', amount: 32000.00, status: 'Pending', category: 'Services' },
  { id: '7', invoiceNumber: 'INV-2024-007', customer: 'Initech', createdDate: '2024-04-20', billDate: '2024-04-21', dueDate: '2024-05-15', amount: 500.00, status: 'Overdue', category: 'Hardware' },
  { id: '8', invoiceNumber: 'INV-2024-008', customer: 'Aperture Sci.', createdDate: '2024-04-22', billDate: '2024-04-23', dueDate: '2024-05-23', amount: 9800.00, status: 'Paid', category: 'Software' },
  { id: '9', invoiceNumber: 'INV-2024-009', customer: 'Black Mesa', createdDate: '2024-04-25', billDate: '2024-04-25', dueDate: '2024-05-25', amount: 11200.00, status: 'Pending', category: 'Services' },
  { id: '10', invoiceNumber: 'INV-2024-010', customer: 'Oceanic Inc', createdDate: '2024-04-28', billDate: '2024-04-29', dueDate: '2024-05-28', amount: 4500.00, status: 'Cancelled', category: 'Software' },
  { id: '11', invoiceNumber: 'INV-2024-011', customer: 'Oscorp', createdDate: '2024-05-01', billDate: '2024-05-02', dueDate: '2024-06-01', amount: 18500.00, status: 'Pending', category: 'Research' },
  { id: '12', invoiceNumber: 'INV-2024-012', customer: 'S.H.I.E.L.D.', createdDate: '2024-05-03', billDate: '2024-05-03', dueDate: '2024-06-03', amount: 95000.00, status: 'Paid', category: 'Services' },
  { id: '13', invoiceNumber: 'INV-2024-013', customer: 'Hooli', createdDate: '2024-05-05', billDate: '2024-05-06', dueDate: '2024-06-05', amount: 5400.00, status: 'Draft', category: 'Software' },
  { id: '14', invoiceNumber: 'INV-2024-014', customer: 'Pied Piper', createdDate: '2024-05-08', billDate: '2024-05-08', dueDate: '2024-06-08', amount: 1200.00, status: 'Paid', category: 'Consulting' },
  { id: '15', invoiceNumber: 'INV-2024-015', customer: 'Weyland-Yutani', createdDate: '2024-05-10', billDate: '2024-05-11', dueDate: '2024-06-10', amount: 67000.00, status: 'Pending', category: 'Hardware' },
  { id: '16', invoiceNumber: 'INV-2024-016', customer: 'Tyrell Corp', createdDate: '2024-05-12', billDate: '2024-05-13', dueDate: '2024-06-12', amount: 23400.50, status: 'Overdue', category: 'Software' },
  { id: '17', invoiceNumber: 'INV-2024-017', customer: 'Massive Dynamic', createdDate: '2024-05-15', billDate: '2024-05-15', dueDate: '2024-06-15', amount: 12900.00, status: 'Paid', category: 'Services' },
  { id: '18', invoiceNumber: 'INV-2024-018', customer: 'Vought Intl.', createdDate: '2024-05-18', billDate: '2024-05-19', dueDate: '2024-06-18', amount: 8800.00, status: 'Draft', category: 'Consulting' },
  { id: '19', invoiceNumber: 'INV-2024-019', customer: 'Globex Corp', createdDate: '2024-05-20', billDate: '2024-05-21', dueDate: '2024-06-20', amount: 5600.00, status: 'Pending', category: 'Hardware' },
  { id: '20', invoiceNumber: 'INV-2024-020', customer: 'Shinra Co.', createdDate: '2024-05-22', billDate: '2024-05-23', dueDate: '2024-06-22', amount: 48000.00, status: 'Overdue', category: 'Software' },
];

const INITIAL_COLUMNS: Column[] = [
  { id: 'invoiceNumber', label: 'Invoice #', width: 150, visible: true },
  { id: 'customer', label: 'Customer', width: 220, visible: true },
  { id: 'createdDate', label: 'Date Created', width: 140, visible: true },
  { id: 'billDate', label: 'Bill Date', width: 140, visible: true },
  { id: 'dueDate', label: 'Due Date', width: 140, visible: true },
  { id: 'amount', label: 'Amount', width: 130, visible: true },
  { id: 'category', label: 'Category', width: 150, visible: true },
  { id: 'status', label: 'Status', width: 120, visible: true },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [activeFilters, setActiveFilters] = useState<ColumnFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [anyColumnResized, setAnyColumnResized] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [selectedColumnForFilter, setSelectedColumnForFilter] = useState<keyof Invoice>('invoiceNumber');
  const [dateRange, setDateRange] = useState({ 
    start: startOfMonth(new Date('2024-04-01')), 
    end: endOfMonth(new Date('2024-05-31')) 
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Total width calculation for responsive scroll
  const totalTableWidth = useMemo(() => {
    const selectionColWidth = 64; // 16 * 4
    const actionColWidth = 64; // 16 * 4
    const visibleColsWidth = columns.filter(c => c.visible).reduce((acc, col) => acc + col.width, 0);
    return selectionColWidth + actionColWidth + visibleColsWidth;
  }, [columns]);

  // Viewport/Zoom change handler
  useEffect(() => {
    const handleViewportChange = () => {
      // Force refresh of layout measurements on zoom/resize
      setAnyColumnResized(prev => prev); // dummy trigger
    };

    window.addEventListener('resize', handleViewportChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    };
  }, []);

  // Sorting Handler
  const handleSort = (key: keyof Invoice) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    let result = [...invoices];

    // Global Search
    if (searchQuery) {
      result = result.filter(inv => 
        Object.values(inv).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Date Range Filter (Using createdDate by default)
    result = result.filter(inv => {
      const date = parseISO(inv.createdDate);
      return isWithinInterval(date, { 
        start: startOfDay(dateRange.start), 
        end: endOfDay(dateRange.end) 
      });
    });

    // Column Filters - Use OR logic to allow matching multiple conditions (e.g. multiple statuses)
    if (activeFilters.length > 0) {
      result = result.filter(inv => {
        return activeFilters.some(filter => {
          const value = inv[filter.columnId];
          const filterVal = filter.value.toLowerCase();
          
          if (typeof value === 'string' && ['createdDate', 'billDate', 'dueDate'].includes(filter.columnId as string)) {
            const date = parseISO(value);
            const fDate1 = parseISO(filter.value);
            const fDate2 = filter.value2 ? parseISO(filter.value2) : null;

            switch (filter.operator) {
              case 'before': return isBefore(date, fDate1);
              case 'after': return isAfter(date, fDate1);
              case 'equals': return isEqual(startOfDay(date), startOfDay(fDate1));
              case 'between': return fDate2 ? isAfter(date, fDate1) && isBefore(date, fDate2) : true;
              default: return true;
            }
          }

          const stringVal = String(value).toLowerCase();
          switch (filter.operator) {
            case 'contains': return stringVal.includes(filterVal);
            case 'equals': return stringVal === filterVal;
            case 'startsWith': return stringVal.startsWith(filterVal);
            case 'greaterThan': return Number(value) > Number(filter.value);
            case 'lessThan': return Number(value) < Number(filter.value);
            default: return true;
          }
        });
      });
    }

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [invoices, activeFilters, sortConfig, searchQuery, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, dateRange]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedInvoices.size === paginatedData.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(paginatedData.map(i => i.id)));
    }
  };

  const toggleSelectInvoice = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleColumnVisibility = (id: keyof Invoice) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const resetColumns = () => {
    setColumns(INITIAL_COLUMNS.map(col => ({ ...col })));
    setAnyColumnResized(false);
  };

  const visibleColumns = columns.filter(c => c.visible);

  // Resizing Column
  const onResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
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
            ? { ...col, width: Math.max(80, startWidth + deltaX) } 
            : col
        ));
      });
    };

    const onMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  // Advanced Filter Panel Actions
  const addFilter = () => {
    const isDate = ['createdDate', 'billDate', 'dueDate'].includes(selectedColumnForFilter as string);
    setActiveFilters([...activeFilters, {
      columnId: selectedColumnForFilter,
      operator: isDate ? 'after' : 'contains',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<ColumnFilter>) => {
    setActiveFilters(activeFilters.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full bg-slate-50/10 overflow-hidden relative">
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-10 min-h-0 w-full max-w-full overflow-hidden relative">
        <div className="flex-shrink-0 space-y-6 mb-6 w-full max-w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Invoices
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your billing, payments, and financial records in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddingInvoice(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FileText, label: 'Total Invoices', value: invoices.length, color: 'blue' },
          { icon: CheckCircle2, label: 'Total Paid', value: '$152,430.20', color: 'emerald' },
          { icon: Clock, label: 'Pending Payment', value: '$112,800.50', color: 'amber' },
          { icon: AlertCircle, label: 'Overdue Amount', value: '$94,900.50', color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="glass-morphism p-6 rounded-[32px] border border-slate-200/50 flex items-center gap-5 group hover:border-brand-emerald/20 transition-all shadow-sm">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 glass-morphism p-4 rounded-2xl border border-slate-200/50 shadow-sm relative z-50">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-emerald/50 focus:ring-4 focus:ring-brand-emerald/5 transition-all"
            />
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />
          
          <div className="hidden lg:block">
            <DateRangePicker range={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 h-[42px] min-w-[140px] justify-between ${showStatusDropdown ? 'ring-2 ring-brand-emerald/20 border-brand-emerald' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className={activeFilters.some(f => f.columnId === 'status') ? 'text-brand-emerald' : 'text-slate-400'} />
                <span className="truncate max-w-[100px]">
                  {activeFilters.find(f => f.columnId === 'status')?.value 
                    ? `Status: ${activeFilters.find(f => f.columnId === 'status')?.value}` 
                    : 'Status'}
                </span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-slate-50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Filter by Status</p>
                    </div>
                    {['Paid', 'Pending', 'Overdue', 'Draft'].map((status) => {
                      const isActive = activeFilters.some(f => f.columnId === 'status' && f.value.toLowerCase() === status.toLowerCase());
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            if (isActive) {
                              // If active, remove it
                              setActiveFilters(activeFilters.filter(f => f.columnId !== 'status'));
                            } else {
                              // If not active, replace any existing status filter with this one
                              setActiveFilters([
                                ...activeFilters.filter(f => f.columnId !== 'status'),
                                { columnId: 'status', operator: 'equals', value: status }
                              ]);
                            }
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                            isActive 
                              ? 'bg-brand-emerald/10 text-brand-emerald-dark' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {status}
                          {isActive ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full group-hover:border-slate-300 transition-colors" />
                          )}
                        </button>
                      );
                    })}
                    {activeFilters.some(f => f.columnId === 'status') && (
                      <>
                        <div className="h-px bg-slate-100 my-1 mx-1" />
                        <button 
                          onClick={() => {
                            setActiveFilters(activeFilters.filter(f => f.columnId !== 'status'));
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-50 uppercase tracking-widest transition-all"
                        >
                          Clear Status
                        </button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-emerald transition-all shadow-sm group"
            title="Refresh"
          >
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
          <button 
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-emerald transition-all shadow-sm"
            title="Export CSV"
          >
            <Download size={18} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilterPanel || activeFilters.length > 0
                  ? 'bg-brand-emerald/10 text-brand-emerald-dark border-brand-emerald/50' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              } border`}
            >
              <SlidersHorizontal size={18} />
              Customize
              {activeFilters.length > 0 && (
                <span className="bg-brand-emerald text-white px-2 py-0.5 rounded-full text-[10px] font-black" id="active-filter-count">
                  {activeFilters.length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showFilterPanel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[450px] md:w-[600px] bg-white border border-slate-200 rounded-[32px] shadow-2xl z-[100] p-6 overflow-hidden"
                  id="advanced-filter-dropdown"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Filter size={16} className="text-brand-emerald" />
                          Filter Conditions
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium ml-6">Match <span className="text-brand-emerald-dark font-black">ANY</span> of the filters below</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          value={selectedColumnForFilter}
                          onChange={(e) => setSelectedColumnForFilter(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-emerald transition-all"
                        >
                          {columns.map(col => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                        </select>
                        <button 
                          onClick={addFilter}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-emerald text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-emerald/10"
                        >
                          <Plus size={14} /> Add Condition
                        </button>
                      </div>
                    </div>

                    {activeFilters.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-xs text-slate-400 font-medium">No filters applied. Add a condition to refine your data.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {activeFilters.map((filter, idx) => {
                          const isDate = ['createdDate', 'billDate', 'dueDate'].includes(filter.columnId as string);
                          const colLabel = columns.find(c => c.id === filter.columnId)?.label;
                          
                          return (
                            <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
                              <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest px-2 py-1 bg-brand-emerald/10 rounded-md min-w-[100px] text-center">
                                {colLabel}
                              </span>
                              
                              <select 
                                value={filter.operator}
                                onChange={(e) => updateFilter(idx, { operator: e.target.value as any })}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:border-brand-emerald transition-all"
                              >
                                {isDate ? (
                                  <>
                                    <option value="after">is after</option>
                                    <option value="before">is before</option>
                                    <option value="equals">is exactly</option>
                                    <option value="between">is between</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="contains">contains</option>
                                    <option value="equals">is exactly</option>
                                    <option value="startsWith">starts with</option>
                                    {filter.columnId === 'amount' && (
                                      <>
                                        <option value="greaterThan">is greater than</option>
                                        <option value="lessThan">is less than</option>
                                      </>
                                    )}
                                  </>
                                )}
                              </select>

                              <div className="flex gap-2 items-center">
                                <input 
                                  type={isDate ? "date" : "text"} 
                                  value={filter.value}
                                  onChange={(e) => updateFilter(idx, { value: e.target.value })}
                                  placeholder="Value..."
                                  className="bg-white border border-slate-200 rounded-lg px-4 py-1.5 text-xs focus:outline-none focus:border-brand-emerald transition-all w-32"
                                />
                                {filter.operator === 'between' && (
                                  <>
                                    <span className="text-[10px] text-slate-400 font-bold">AND</span>
                                    <input 
                                      type={isDate ? "date" : "text"} 
                                      value={filter.value2 || ''}
                                      onChange={(e) => updateFilter(idx, { value2: e.target.value })}
                                      className="bg-white border border-slate-200 rounded-lg px-4 py-1.5 text-xs focus:outline-none focus:border-brand-emerald transition-all w-32"
                                    />
                                  </>
                                )}
                              </div>

                              <button 
                                onClick={() => removeFilter(idx)}
                                className="ml-auto p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => setActiveFilters([])}
                        className="px-4 py-2 text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                      >
                        Clear All
                      </button>
                      <button 
                        onClick={() => setShowFilterPanel(false)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-emerald transition-all shadow-sm ${showColumnSettings ? 'ring-2 ring-brand-emerald/20 border-brand-emerald' : ''}`}
            >
              <Settings2 size={18} />
            </button>
            <AnimatePresence>
              {showColumnSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[24px] shadow-2xl z-[100] p-4"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Column Settings</h4>
                    <button 
                      onClick={resetColumns}
                      className="text-[10px] font-black text-brand-emerald hover:text-brand-emerald-dark uppercase tracking-widest transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                    {columns.map(col => (
                      <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={col.visible}
                            onChange={() => toggleColumnVisibility(col.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${col.visible ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'border-slate-200'}`}>
                            {col.visible && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                          </div>
                        </div>
                        <span className={`text-xs font-bold transition-colors ${col.visible ? 'text-slate-900' : 'text-slate-400'}`}>
                          {col.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>

      {/* Bulk Action Strip */}
      <AnimatePresence>
        {selectedInvoices.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-white/10 mb-2">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm font-bold bg-brand-emerald/20 px-3 py-1 rounded-lg">
                  {selectedInvoices.size} Selected
                </span>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex gap-2">
                  <button className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <Mail size={14} /> Email
                  </button>
                  <button className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <Printer size={14} /> Print
                  </button>
                  <button className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors">
                  <Trash2 size={14} /> Delete Selected
                </button>
                <button 
                  onClick={() => setSelectedInvoices(new Set())}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoices Create Form / Advanced Filter Panel */}
      <AnimatePresence>
        {isAddingInvoice && (
          <CreateInvoiceForm 
            onClose={() => setIsAddingInvoice(false)}
            onSave={(newInvoice) => {
              setInvoices([newInvoice, ...invoices]);
              setIsAddingInvoice(false);
            }}
          />
        )}
        {showFilterPanel && (
          <div className="hidden">
            {/* Filter panel moved to dropdown */}
          </div>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <div className="glass-morphism rounded-[32px] border border-slate-200/50 shadow-xl overflow-hidden relative w-full flex flex-col flex-1 min-h-0 bg-white" ref={tableContainerRef}>
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar w-full flex-1 bg-white relative">
          <div className="flex flex-col" style={{ 
            width: anyColumnResized ? `${totalTableWidth}px` : '100%',
            minWidth: '100%' 
          }}>
            <div className="border-b border-slate-200/60 bg-white flex select-none sticky top-0 z-40 min-w-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
              {/* Selection Column Header */}
              <div className="w-16 flex items-center justify-center border-r border-slate-200/50 shrink-0 bg-white">
                <label className="relative flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={selectedInvoices.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedInvoices.size === paginatedData.length && paginatedData.length > 0 ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-300'}`}>
                    {selectedInvoices.size === paginatedData.length && paginatedData.length > 0 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                  </div>
                </label>
              </div>

              <Reorder.Group 
                axis="x" 
                values={columns} 
                onReorder={setColumns}
                className="flex flex-1"
              >
                {columns.filter(c => c.visible).map((column) => (
                  <Reorder.Item 
                    key={column.id} 
                    value={column}
                    transition={resizingColumn ? { duration: 0 } : undefined}
                    className="relative group border-r border-slate-200/50 bg-white"
                    style={{ 
                      width: anyColumnResized ? column.width : 'auto', 
                      flex: anyColumnResized ? `0 0 ${column.width}px` : `1 1 0%`, 
                      minWidth: anyColumnResized ? column.width : 80 
                    }}
                  >
                    <div 
                      className={`h-full px-4 py-4 flex items-center justify-between cursor-pointer transition-colors ${resizingColumn ? '' : 'hover:bg-slate-50'} ${
                        sortConfig?.key === column.id ? 'bg-brand-emerald/[0.03]' : ''
                      }`}
                      onClick={() => handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest truncate">
                          {column.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {sortConfig?.key === column.id ? (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-brand-emerald" /> : <ArrowDown size={14} className="text-brand-emerald" />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>

                    {/* Column Resizer Handle */}
                    <div
                      onMouseDown={(e) => onResizeStart(e, column.id, column.width)}
                      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-brand-emerald/50 active:bg-brand-emerald transition-colors ${
                        resizingColumn === column.id ? 'bg-brand-emerald w-0.5' : 'bg-transparent'
                      }`}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              
              {/* Action Header - Removed border-l to fix double border */}
              <div className="w-16 bg-white shrink-0 sticky right-0 z-40 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
              </div>
            </div>

            <div className="flex flex-col min-w-full">
              <AnimatePresence mode="popLayout">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <motion.div
                      key={row.id}
                      layout={!resizingColumn}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={resizingColumn ? { duration: 0 } : undefined}
                      className={`flex min-w-full border-b border-slate-100 last:border-b-0 group relative ${resizingColumn ? '' : 'hover:bg-slate-50/50 transition-colors'} ${selectedInvoices.has(row.id) ? 'bg-brand-emerald/[0.04]' : ''}`}
                    >
                      {/* Selection Column Row */}
                      <div className="w-16 flex items-center justify-center border-r border-slate-200/50 transition-colors bg-white/50">
                        <label className="relative flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={selectedInvoices.has(row.id)}
                            onChange={() => toggleSelectInvoice(row.id)}
                          />
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedInvoices.has(row.id) ? 'bg-brand-emerald border-brand-emerald shadow-sm' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                            {selectedInvoices.has(row.id) && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -mt-0.5" />}
                          </div>
                        </label>
                      </div>

                      {columns.filter(c => c.visible).map((column, colIdx, colArr) => (
                        <div 
                          key={column.id} 
                          className={`px-4 py-4 text-sm font-medium flex items-center min-w-0 border-r border-slate-200/50 ${resizingColumn ? '' : 'transition-colors'} ${
                            sortConfig?.key === column.id ? 'bg-brand-emerald/[0.01]' : ''
                          }`}
                          style={{ 
                            width: anyColumnResized ? column.width : 'auto', 
                            flex: anyColumnResized ? `0 0 ${column.width}px` : `1 1 0%`, 
                            minWidth: anyColumnResized ? column.width : 80 
                          }}
                        >
                          {column.id === 'status' ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(row.status)}`}>
                              {row.status === 'Paid' && <CheckCircle2 size={10} className="mr-1" />}
                              {row.status === 'Overdue' && <AlertCircle size={10} className="mr-1" />}
                              {row.status}
                            </span>
                          ) : column.id === 'amount' ? (
                            <span className="text-slate-900 font-black">
                              ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : column.id === 'invoiceNumber' ? (
                            <span className="text-slate-900 font-bold hover:text-brand-emerald transition-colors cursor-pointer">
                              {row.invoiceNumber}
                            </span>
                          ) : column.id.includes('Date') ? (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar size={12} className="text-slate-300" />
                              {format(parseISO(row[column.id] as string), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-slate-600 truncate block">{row[column.id]}</span>
                          )}
                        </div>
                      ))}
                      
                      {/* Action Cell - Removed border-l and improved shadow */}
                      <div className="w-16 flex items-center justify-center bg-white group-hover:bg-slate-50 transition-colors sticky right-0 z-30 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
                        <div className="relative group/menu">
                          <button className="p-2 text-slate-400 hover:text-brand-emerald transition-all hover:scale-110 rounded-lg outline-none cursor-pointer">
                            <MoreHorizontal size={18} />
                          </button>
                          
                          {/* Dropdown Menu - Positioned to prevent overflow and overlap */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-50 transform origin-right scale-90 group-hover/menu:scale-100">
                            <div className="px-4 py-2 mb-1 border-b border-slate-50">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Actions</p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center gap-2 transition-colors">
                              <Eye size={14} className="text-slate-400" /> View Invoice
                            </button>
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center gap-2 transition-colors">
                              <Edit size={14} className="text-slate-400" /> Edit Details
                            </button>
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center gap-2 transition-colors">
                              <Copy size={14} className="text-slate-400" /> Duplicate
                            </button>
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center gap-2 transition-colors">
                              <Archive size={14} className="text-slate-400" /> Archive
                            </button>
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-emerald-dark flex items-center gap-2 transition-colors">
                              <Download size={14} className="text-slate-400" /> Export PDF
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2" />
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors">
                              <Trash2 size={14} /> Delete Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <FileText size={32} className="text-slate-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900">No matching invoices found</p>
                      <p className="text-xs">Adjust your search or filters to see more results.</p>
                    </div>
                    <button 
                      onClick={() => { setActiveFilters([]); setSearchQuery(''); }}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-brand-emerald-dark hover:bg-slate-50 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Table Footer - Pagination */}
        <div className="border-t border-slate-100 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-40 shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.05)]">
          <div className="text-xs font-medium text-slate-500">
            Showing <span className="text-slate-900 font-bold">{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="text-slate-900 font-bold">{Math.min(filteredData.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> invoices
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-emerald transition-all"
              >
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-brand-emerald-dark">{currentPage}</span> <span className="text-slate-400 font-normal mx-1">of</span> {totalPages || 1}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-brand-emerald hover:border-brand-emerald/30 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all shadow-sm group"
                >
                  <ChevronDown size={20} className="rotate-90 group-active:-translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-brand-emerald hover:border-brand-emerald/30 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all shadow-sm group"
                >
                  <ChevronDown size={20} className="-rotate-90 group-active:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
