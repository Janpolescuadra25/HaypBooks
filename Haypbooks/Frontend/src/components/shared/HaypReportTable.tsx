import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Printer, Download, Share2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

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
  
  // Sorting (optional)
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  
  // Grand Total section (optional)
  grandTotalLabel?: string;
  grandTotalValue?: number | string;
  
  children?: React.ReactNode;
}

export const HaypReportTable: React.FC<HaypReportTableProps> & {
  GroupHeaderRow: React.FC<{
    isExpanded: boolean;
    onToggle: () => void;
    title: string;
    colSpan: number;
  }>;
  BeginningBalanceRow: React.FC<{
    label: string;
    amount: number;
    colSpan: number;
  }>;
  TotalRow: React.FC<{
    label: string;
    amount?: number;
    balance?: number;
    colSpan: number;
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
  sortField,
  sortDir,
  onSort,
  grandTotalLabel,
  grandTotalValue,
  children
}) => {
  return (
    <div className="bg-white border text-slate-900 border-slate-200 rounded-[32px] overflow-hidden shadow-xl flex flex-col min-h-[600px]">
      {/* Report Toolbar */}
      <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
           <div className="relative">
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none transition-all pr-8 appearance-none"
                value={layout}
                onChange={(e) => onLayoutChange?.(e.target.value as 'Standard' | 'Compact')}
              >
                <option>Standard</option>
                <option>Compact</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onMail} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Mail size={18} /></button>
          <button onClick={onPrint} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Printer size={18} /></button>
          <button onClick={onDownload} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={18} /></button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button onClick={onShare} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative max-h-[800px]">
        <div className="min-w-[1000px] flex flex-col items-center">
          {/* Report Identity (Header area, moved out of sticky flow to stay at top of content but scroll away) */}
          <div className="text-center py-8 w-full">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{title}</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{companyName}</p>
            <p className="text-sm font-medium text-slate-400 mt-1">{dateSubtitle}</p>
          </div>

          {/* Structured Table */}
          <div className="w-full px-12 pb-12">
            <table className="w-full border-collapse relative">
              <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgb(226,232,240)]">
                <tr>
                  {columns.map((col) => (
                    <th 
                      key={col.key} 
                      onClick={() => col.sortable && onSort && onSort(col.key)}
                      className={`px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-slate-50 hover:text-slate-600 transition-colors select-none' : ''}`}
                      style={{ resize: 'horizontal', overflow: 'hidden' }}
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
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {children}
            </tbody>

            {/* Report Grand Total */}
            {grandTotalLabel && (
              <tfoot>
                <tr className="bg-slate-900 text-white leading-loose">
                  <td colSpan={columns.length - 1} className="px-4 py-5 text-sm font-black uppercase tracking-[0.2em] text-right">
                    {grandTotalLabel}
                  </td>
                  <td className="px-4 py-5 text-right text-sm font-black font-mono">
                    {grandTotalValue !== undefined ? (
                      typeof grandTotalValue === 'number' 
                        ? `$ ${grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : grandTotalValue
                    ) : ''}
                  </td>
                </tr>
              </tfoot>
            )}
            </table>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-slate-100" />
            This report is for internal management use only
            <div className="w-12 h-px bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for common elements in report tables

HaypReportTable.GroupHeaderRow = function GroupHeaderRow({ isExpanded, onToggle, title, colSpan }) {
  return (
    <tr 
      onClick={onToggle}
      className="bg-slate-50 border-b border-slate-100 cursor-pointer group hover:bg-slate-100 transition-colors"
    >
      <td colSpan={colSpan} className="px-4 py-3">
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

HaypReportTable.BeginningBalanceRow = function BeginningBalanceRow({ label, amount, colSpan }) {
  return (
    <tr className="border-b border-slate-50 italic">
      <td className="px-8 py-3 text-xs font-medium text-slate-400" colSpan={colSpan - 1}>
        {label}
      </td>
      <td className="px-4 py-3 text-right text-xs font-bold text-slate-500 font-mono">
        {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
};

HaypReportTable.TotalRow = function TotalRow({ label, amount, balance, colSpan }) {
  const isBoth = amount !== undefined && balance !== undefined;
  const isNeither = amount === undefined && balance === undefined;
  
  return (
    <tr className="bg-slate-50/50 border-b-2 border-slate-200">
      <td 
        colSpan={isNeither ? colSpan : colSpan - (isBoth ? 2 : 1)} 
        className="px-4 py-4 text-xs font-black text-slate-900 uppercase tracking-widest text-right"
      >
        {label}
      </td>
      {amount !== undefined && (
        <td className="px-4 py-4 text-right text-xs font-black text-brand-emerald font-mono">
          $ {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      )}
      {balance !== undefined && (
        <td className="px-4 py-4 text-right text-xs font-black text-slate-900 font-mono">
          $ {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      )}
    </tr>
  );
};
