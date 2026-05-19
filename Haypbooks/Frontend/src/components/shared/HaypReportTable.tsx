import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Printer, Download, Share2, Settings2, ArrowUp, ArrowDown, ArrowUpDown, X } from 'lucide-react';

export const REPORT_ROW_EVEN = 'bg-white';
export const REPORT_ROW_ODD = 'bg-slate-50/30';

export interface HaypReportColumn {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
}

export interface HaypReportTableProps {
  title: string;
  companyName: string;
  dateSubtitle: string;
  columns: HaypReportColumn[];
  layout?: 'Standard' | 'Compact';
  onLayoutChange?: (layout: 'Standard' | 'Compact') => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onMail?: () => void;
  showCustomize?: boolean;
  onToggleCustomize?: () => void;
  hiddenColumns?: string[];
  onHiddenColumnsChange?: (columns: string[]) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateChange?: (from: string, to: string) => void;
  
  // Sorting (optional)
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  
  // Grand Total section (optional)
  grandTotalLabel?: string;
  grandTotalValue?: number | string;
  
  currencySymbol?: string;
  children?: React.ReactNode;
}

export const HaypReportTable: React.FC<HaypReportTableProps> & {
  GroupHeaderRow: React.FC<{
    isExpanded: boolean;
    onToggle?: () => void;
    title: string;
    colSpan: number;
    currencySymbol?: string;
  }>;
  BeginningBalanceRow: React.FC<{
    label: string;
    amount?: number;
    colSpan: number;
    currencySymbol?: string;
  }>;
  TotalRow: React.FC<{
    label: string;
    amount?: number;
    balance?: number;
    colSpan: number;
    currencySymbol?: string;
  }>;
} = ({
  title,
  companyName,
  dateSubtitle,
  columns,
  layout = 'Standard',
  onLayoutChange,
  onDownload,
  onPrint,
  onShare,
  onMail,
  showCustomize = false,
  onToggleCustomize,
  hiddenColumns,
  onHiddenColumnsChange,
  dateFrom,
  dateTo,
  onDateChange,
  sortField,
  sortDir,
  onSort,
  grandTotalLabel,
  grandTotalValue,
  currencySymbol = '₱',
  children,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [tableWidth, setTableWidth] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(() => new Map());
  const [resizing, setResizing] = useState<{ key: string; startX: number; startWidth: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'visual'>('data');
  const [internalHiddenColumns, setInternalHiddenColumns] = useState<string[]>([]);
  const [numberFormat, setNumberFormat] = useState<'comma' | 'plain'>('comma');
  const [showCents, setShowCents] = useState(true);
  const [negativeFormat, setNegativeFormat] = useState<'parentheses' | 'minus'>('parentheses');
  const [rowHeight, setRowHeight] = useState<'comfortable' | 'normal' | 'compact'>('normal');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollProxyContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollProxyWidthRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const hasChildren = React.Children.count(children) > 0;

  useEffect(() => {
    if (!tableRef.current) return;
    const node = tableRef.current;
    const observer = new ResizeObserver(() => {
      if (node) {
        setTableWidth(node.scrollWidth);
      }
    });
    observer.observe(node);
    setTableWidth(node.scrollWidth);
    return () => observer.disconnect();
  }, [columns, children]);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const nextWidth = Math.max(80, resizing.startWidth + (e.clientX - resizing.startX));
      setColumnWidths((prev) => {
        const next = new Map(prev);
        next.set(resizing.key, nextWidth);
        return next;
      });
      const headerCell = document.querySelector(`th[data-column-key="${resizing.key}"]`) as HTMLElement | null;
      if (headerCell) {
        headerCell.style.width = `${nextWidth}px`;
      }
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    const main = scrollRef.current;
    const proxy = scrollProxyContainerRef.current;
    if (!main || !proxy) return;

    const syncProxyToMain = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      requestAnimationFrame(() => {
        proxy.scrollLeft = main.scrollLeft;
        isSyncingRef.current = false;
      });
    };

    const syncMainToProxy = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      requestAnimationFrame(() => {
        main.scrollLeft = proxy.scrollLeft;
        isSyncingRef.current = false;
      });
    };

    main.addEventListener('scroll', syncProxyToMain);
    proxy.addEventListener('scroll', syncMainToProxy);

    return () => {
      main.removeEventListener('scroll', syncProxyToMain);
      proxy.removeEventListener('scroll', syncMainToProxy);
    };
  }, []);

  useEffect(() => {
    if (scrollProxyWidthRef.current) {
      scrollProxyWidthRef.current.style.width = `${tableWidth}px`;
    }
  }, [tableWidth]);

  const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setIsScrolled(target.scrollTop > 0);
  };

  const handleResizeMouseDown = (key: string, startX: number) => {
    const startWidth = columnWidths.get(key) ?? 120;
    setResizing({ key, startX, startWidth });
  };

  const activeHiddenColumns = hiddenColumns ?? internalHiddenColumns;
  const visibleColumns = useMemo(
    () => columns.filter((col) => !activeHiddenColumns.includes(col.key)),
    [columns, activeHiddenColumns],
  );

  const visibleCount = visibleColumns.length;
  const toggleColumn = (key: string) => {
    const currentlyHidden = activeHiddenColumns.includes(key);
    const nextHidden = currentlyHidden
      ? activeHiddenColumns.filter((col) => col !== key)
      : [...activeHiddenColumns, key];

    if (!currentlyHidden && visibleCount <= 1) return;

    if (hiddenColumns !== undefined) {
      onHiddenColumnsChange?.(nextHidden);
    } else {
      setInternalHiddenColumns(nextHidden);
      onHiddenColumnsChange?.(nextHidden);
    }
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    if (field === 'from') {
      onDateChange?.(value, dateTo ?? '')
    } else {
      onDateChange?.(dateFrom ?? '', value)
    }
  }

  return (
    <div className="bg-white border text-slate-900 border-slate-200 rounded-[32px] overflow-hidden shadow-xl flex flex-col min-h-[600px]">
      <style jsx global>{`
        .scrollbar-vertical-hidden {
          overflow: auto;
          scrollbar-width: none;
        }
        .scrollbar-vertical-hidden::-webkit-scrollbar {
          height: 8px;
          width: 0;
        }
        .scrollbar-vertical-hidden::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-vertical-hidden::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
      <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleCustomize}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${showCustomize ? 'text-brand-emerald' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Settings2 size={14} />
            Customize
          </button>
          <button onClick={onMail} title="Send report by email" aria-label="Send report by email" className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Mail size={18} /></button>
          <button onClick={onPrint} title="Print report" aria-label="Print report" className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Printer size={18} /></button>
          <button onClick={onDownload} title="Download report" aria-label="Download report" className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={18} /></button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button onClick={onShare} title="Share report" aria-label="Share report" className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-vertical-hidden custom-scrollbar relative" onScroll={handleHeaderScroll}>
        <div className="min-w-[1000px] flex flex-col items-center">
          <div className="text-center py-8 w-full">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{title}</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{companyName}</p>
            <p className="text-sm font-medium text-slate-400 mt-1">{dateSubtitle}</p>
          </div>

          <div className="w-full px-12 pb-12 relative">
            <table ref={tableRef} className="w-full border-collapse relative">
              <thead className={`sticky top-0 z-20 bg-white ${isScrolled ? 'shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]' : 'shadow-[0_1px_0_0_rgb(226,232,240)]'}`}>
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      data-column-key={col.key}
                      onClick={() => {
                        console.log('[HRT] th clicked, col.key:', col.key, 'sortable:', col.sortable, 'onSort exists:', !!onSort)
                        if (col.sortable && onSort) onSort(col.key)
                      }}
                      className={`relative px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 last:border-r-0 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-slate-50 hover:text-slate-600 transition-colors select-none' : ''}`}
                    >
                      <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                        {col.header}
                        {col.sortable && (
                          <span className="flex-shrink-0">
                            {sortField === col.key ? (
                              sortDir === 'asc' ? <ArrowUp size={12} className="text-brand-emerald" /> : <ArrowDown size={12} className="text-brand-emerald" />
                            ) : (
                              <ArrowUpDown size={12} className="text-slate-300" />
                            )}
                          </span>
                        )}
                      </div>
                      <div
                        role="separator"
                        onMouseDown={(e) => handleResizeMouseDown(col.key, e.clientX)}
                        className="absolute right-0 top-0 h-full w-3 cursor-col-resize hover:bg-slate-300"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hasChildren ? children : (
                  <tr>
                    <td colSpan={visibleCount} className="py-16 text-center">
                      <p className="text-sm text-slate-400 font-medium">No transactions found for the selected period.</p>
                      <p className="text-xs text-slate-300 mt-1">Try adjusting your filters or date range.</p>
                    </td>
                  </tr>
                )}
              </tbody>

              {grandTotalLabel && (
                <tfoot>
                  <tr className="bg-slate-900 text-white leading-loose">
                    <td colSpan={Math.max(1, visibleCount - 1)} className="px-4 py-5 text-sm font-black uppercase tracking-[0.2em] text-right">
                      {grandTotalLabel}
                    </td>
                    <td className="px-4 py-5 text-right text-sm font-black font-mono">
                      {grandTotalValue !== undefined ? (
                        typeof grandTotalValue === 'number'
                          ? `${currencySymbol} ${grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : grandTotalValue
                      ) : ''}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className={`absolute top-0 right-0 h-full w-[280px] bg-white border-l border-slate-200 shadow-[-4px_0_16px_rgba(0,0,0,0.08)] z-30 flex flex-col transition-transform duration-300 ease-in-out ${showCustomize ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Customize Report</p>
              </div>
              <button type="button" onClick={onToggleCustomize} title="Close customize panel" aria-label="Close customize panel" className="text-slate-400 hover:text-slate-900">
                <X size={16} />
              </button>
            </div>
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'data' ? 'text-slate-900 border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Data
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'visual' ? 'text-slate-900 border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Visual
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {activeTab === 'data' ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Columns</p>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50">
                      {columns.map((col) => {
                        const isHidden = activeHiddenColumns.includes(col.key)
                        const visibleColumnCount = columns.length - activeHiddenColumns.length
                        const disableCheckbox = !isHidden && visibleColumnCount <= 1
                        return (
                          <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!isHidden}
                              disabled={disableCheckbox}
                              onChange={() => toggleColumn(col.key)}
                              className="w-4 h-4 rounded border-slate-300 text-brand-emerald focus:ring-brand-emerald"
                            />
                            <span className="text-xs font-medium text-slate-700">{col.header}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range</p>
                    <div className="mt-3 grid gap-3">
                      <input
                        type="date"
                        value={dateFrom ?? ''}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        title="From date"
                        aria-label="From date"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                      <input
                        type="date"
                        value={dateTo ?? ''}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        title="To date"
                        aria-label="To date"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number Format</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'comma', label: '1,000.00' },
                        { key: 'plain', label: '1000.00' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-center gap-2 px-4 py-2 cursor-pointer">
                          <div className={`w-4 h-4 rounded-full border-2 ${numberFormat === option.key ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-300'} flex items-center justify-center`}>
                            {numberFormat === option.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Show Cents</p>
                    <button
                      type="button"
                      onClick={() => setShowCents((prev) => !prev)}
                      className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full border ${showCents ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-slate-200 text-slate-600'}`}
                    >
                      <span className={`w-4 h-4 rounded-full border ${showCents ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-300 bg-white'}`} />
                      <span className="text-xs font-medium">{showCents ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Negative Format</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'parentheses', label: '(123.45)' },
                        { key: 'minus', label: '-123.45' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-center gap-2 px-4 py-2 cursor-pointer">
                          <div className={`w-4 h-4 rounded-full border-2 ${negativeFormat === option.key ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-300'} flex items-center justify-center`}>
                            {negativeFormat === option.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layout</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'Standard', label: 'Standard' },
                        { key: 'Compact', label: 'Compact' },
                      ].map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => onLayoutChange?.(option.key as 'Standard' | 'Compact')}
                          className={`w-full text-left px-4 py-2 rounded-lg border ${layout === option.key ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {layout === 'Standard' && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Row Height</p>
                      <div className="mt-3 space-y-2">
                        {[
                          { key: 'comfortable', label: 'Comfortable' },
                          { key: 'normal', label: 'Normal' },
                          { key: 'compact', label: 'Compact' },
                        ].map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setRowHeight(option.key as 'comfortable' | 'normal' | 'compact')}
                            className={`w-full text-left px-4 py-2 rounded-lg border ${rowHeight === option.key ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                          >
                            <span className="text-xs font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollProxyContainerRef} className="h-3 bg-white border-t border-slate-100 overflow-x-auto overflow-y-hidden flex-shrink-0">
        <div ref={scrollProxyWidthRef} className="h-[1px]" />
      </div>
    </div>
  );
};

HaypReportTable.GroupHeaderRow = function GroupHeaderRow({ isExpanded, onToggle, title, colSpan }) {
  return (
    <tr
      onClick={onToggle}
      className={`bg-slate-50 border-b border-slate-100 ${onToggle ? 'cursor-pointer hover:bg-slate-100' : ''}`}
    >
      <td colSpan={colSpan} className="px-4 py-3 border-r-0">
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
            {title}
          </span>
        </div>
      </td>
    </tr>
  );
};

HaypReportTable.BeginningBalanceRow = function BeginningBalanceRow({ label, amount, colSpan, currencySymbol = '₱' }) {
  return (
    <tr className="border-b border-slate-50 italic">
      <td className="px-8 py-3 text-xs font-medium text-slate-400" colSpan={colSpan - 1}>
        {label}
      </td>
      <td className="px-4 py-3 text-right text-xs font-bold text-slate-500 font-mono whitespace-nowrap">
        {amount === undefined
          ? 'Loading…'
          : `${currencySymbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </td>
    </tr>
  );
};

HaypReportTable.TotalRow = function TotalRow({ label, amount, balance, colSpan, currencySymbol = '₱' }) {
  const isBoth = amount !== undefined && balance !== undefined;
  const isNeither = amount === undefined && balance === undefined;

  const labelColSpan = isNeither
    ? colSpan
    : Math.max(1, colSpan - (isBoth ? 2 : 1))

  return (
    <tr className="bg-slate-50/50 border-b-2 border-slate-200">
      <td
        colSpan={labelColSpan}
        className="px-4 py-4 text-xs font-black text-slate-900 uppercase tracking-widest text-right border-t-2 border-slate-300"
      >
        {label}
      </td>
      {amount !== undefined && (
        <td className="px-4 py-4 text-right text-xs font-black text-brand-emerald font-mono whitespace-nowrap border-t-2 border-slate-300">
          {currencySymbol} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      )}
      {balance !== undefined && (
        <td className="px-4 py-4 text-right text-xs font-black text-slate-900 font-mono whitespace-nowrap border-t-2 border-slate-300">
          {currencySymbol} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      )}
    </tr>
  );
};
