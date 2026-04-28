/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ColumnDef,
  ColumnOrderState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  FilterX,
  Filter,
  Eye,
  List,
  Download,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { DraggableHeader } from './DraggableHeader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';

const STORAGE_KEY = 'haypbooks_vendor_table_config';

interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  balance?: number
  status?: string
}

interface VendorTableProps {
  data: Vendor[];
  currency: string;
  onRefresh: () => void;
  onExportSelected: (selectedIds: string[]) => void;
  onDeactivateSelected: (selectedIds: string[]) => void;
  onDeleteSelected: (selectedIds: string[]) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  globalFilter: string;
  setGlobalFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onViewTransactions?: (id: string) => void;
}

export function VendorTable({ 
  data, 
  currency,
  onRefresh,
  onExportSelected,
  onDeactivateSelected,
  onDeleteSelected,
  onView,
  onEdit,
  onDeactivate,
  onDelete,
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  onViewTransactions
}: VendorTableProps) {
  // --- Load Initial State from LocalStorage ---
  const savedConfig = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  // --- Table State ---
  const [sorting, setSorting] = useState<SortingState>(savedConfig?.sorting || []);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedConfig?.columnOrder || []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedConfig?.columnVisibility || {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnSizing, setColumnSizing] = useState(savedConfig?.columnSizing || {});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const columns = useMemo<ColumnDef<Vendor>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => {
        const isAll = table.getIsAllPageRowsSelected();
        const isSome = table.getIsSomePageRowsSelected();
        return (
          <div className="flex items-center justify-center w-full">
            <Checkbox
              checked={isAll ? true : isSome ? "indeterminate" as any : false}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="border-gray-400"
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-400"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 48,
      minSize: 40,
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-semibold text-gray-800 truncate">{row.original.name || '—'}</span>,
      size: 240,
      minSize: 150,
    },
    {
      accessorKey: 'email',
      id: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-gray-500 text-xs truncate">{row.original.email || '—'}</span>,
      size: 220,
      minSize: 120,
    },
    {
      accessorKey: 'phone',
      id: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-gray-500 text-xs truncate">{row.original.phone || '—'}</span>,
      size: 150,
      minSize: 100,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'ACTIVE';
        return (
          <div className="flex items-center">
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize text-[10px] px-2 py-0 h-5 border-none font-bold tracking-tight",
                status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-700",
                status === 'INACTIVE' && "bg-gray-500/10 text-gray-700"
              )}
            >
              {status}
            </Badge>
          </div>
        );
      },
      size: 130,
      minSize: 90,
    },
    {
      accessorKey: 'balance',
      id: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const formatted = formatCurrency(row.original.balance ?? 0, currency);
        return <div className="text-right font-mono font-medium text-xs text-gray-900 tabular-nums">{formatted}</div>;
      },
      size: 130,
      minSize: 100,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.original.status || 'ACTIVE';

        return (
          <div className="flex items-center justify-center gap-1 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all bg-transparent border border-transparent hover:border-slate-300 cursor-pointer focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-2xl border-slate-300 p-1 bg-white z-[100]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5">Vendor Options</DropdownMenuLabel>
                  <DropdownMenuSeparator className="opacity-50" />
                </DropdownMenuGroup>
                
                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer hover:bg-slate-100 focus:bg-slate-200 focus:text-slate-900 transition-colors"
                  onClick={() => onView(row.original.id)}
                >
                  <Eye className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <span className="font-medium">View Details</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer focus:bg-gray-800 focus:text-white transition-colors"
                  onClick={() => onEdit(row.original.id)}
                >
                  <Edit2 className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <span className="font-medium">Edit Vendor</span>
                </DropdownMenuItem>

                {onViewTransactions && (
                  <DropdownMenuItem 
                    className="text-xs py-2 cursor-pointer focus:bg-gray-800 focus:text-white transition-colors"
                    onClick={() => onViewTransactions(row.original.id)}
                  >
                    <List className="mr-2.5 h-4 w-4 opacity-70" /> 
                    <span className="font-medium">View Transactions</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer focus:bg-gray-800 focus:text-white transition-colors"
                  onClick={() => onExportSelected([row.original.id])}
                >
                  <Download className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <span className="font-medium">Export Vendor Data</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="opacity-50" />

                {status === 'ACTIVE' ? (
                  <DropdownMenuItem 
                    className="text-xs py-2 cursor-pointer focus:bg-gray-800 focus:text-white transition-colors font-semibold"
                    onClick={() => onDeactivate(row.original.id)}
                  >
                    <Trash2 className="mr-2.5 h-4 w-4 opacity-70" /> 
                    <span>Deactivate Vendor</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    className="text-xs py-2 cursor-pointer focus:bg-gray-800 focus:text-white transition-colors font-semibold"
                    onClick={() => onDelete(row.original.id)}
                  >
                    <Trash2 className="mr-2.5 h-4 w-4 opacity-70" /> 
                    <span>Delete Vendor</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
      minSize: 80,
      enableSorting: false,
      enableHiding: false,
    },
  ], [currency, onEdit, onView, onDeactivate, onDelete]);

  // --- Save State to LocalStorage ---
  useEffect(() => {
    const config = {
      sorting,
      columnOrder,
      columnVisibility,
      columnSizing,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [sorting, columnOrder, columnVisibility, columnSizing]);

  // Reset defaults
  const resetLayout = () => {
    setColumnOrder(columns.map((c) => (c.id as string) || ((c as any).accessorKey as string)));
    setColumnVisibility({});
    setColumnSizing({});
    setSorting([]);
    setGlobalFilter('');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Initialize column order if empty
  useEffect(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(columns.map((c) => (c.id as string) || ((c as any).accessorKey as string)));
    }
  }, [columns, columnOrder]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      pagination,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Calculate totals
  const totalBalance = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((sum, row) => {
      return sum + (row.original.balance ?? 0);
    }, 0);
  }, [table.getFilteredRowModel().rows]);

  // --- DND Logic ---
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      // Prevent moving 'select' column or moving another column into the 'select' position (index 0)
      if (active.id === 'select' || over.id === 'select') return;

      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        
        // Final guard: never allow anything at index 0 except 'select'
        const sorted = arrayMove(columnOrder, oldIndex, newIndex);
        if (sorted[0] !== 'select') return columnOrder;
        
        return sorted;
      });
    }
  }

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  
  const canDeactivateSelected = selectedCount > 0 && selectedRows.some((row) => (row.original.status ?? 'ACTIVE') === 'ACTIVE');
  const canDeleteSelected = selectedCount > 0 && selectedRows.every((row) => (row.original.status ?? 'ACTIVE') !== 'ACTIVE');

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden border border-slate-300 shadow-sm rounded-xl">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-emerald-50/20 gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-600/50" />
            <Input
              placeholder="Search vendors..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-white border-slate-300 h-9 text-sm focus-visible:ring-emerald-700/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-slate-200 rounded-full animate-in fade-in zoom-in-95">
              <span className="text-[11px] font-bold text-emerald-700">{selectedCount} Selected</span>
              <div className="w-[1px] h-3 bg-emerald-200" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px] text-emerald-700 hover:bg-emerald-100"
                onClick={() => onExportSelected(selectedRows.map(r => r.original.id))}
              >
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px] text-rose-700 hover:bg-rose-100"
                onClick={() => {
                  if (canDeactivateSelected) onDeactivateSelected(selectedRows.map(r => r.original.id));
                  else if (canDeleteSelected) onDeleteSelected(selectedRows.map(r => r.original.id));
                }}
                disabled={!canDeactivateSelected && !canDeleteSelected}
              >
                {canDeactivateSelected ? 'Deactivate' : 'Delete'}
              </Button>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 gap-1.5 px-3 cursor-pointer shadow-sm">
               <Filter className="h-4 w-4" />
               <span>{statusFilter === 'ALL' ? 'All Statuses' : statusFilter === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-white shadow-2xl border-slate-200 p-1 z-[100]">
               <DropdownMenuItem onClick={() => setStatusFilter('ALL')} className={cn("text-xs py-2 cursor-pointer font-medium", statusFilter === 'ALL' && "bg-emerald-50 text-emerald-700 focus:bg-emerald-50")}>All Statuses</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setStatusFilter('ACTIVE')} className={cn("text-xs py-2 cursor-pointer font-medium", statusFilter === 'ACTIVE' && "bg-emerald-50 text-emerald-700 focus:bg-emerald-50")}>Active</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setStatusFilter('INACTIVE')} className={cn("text-xs py-2 cursor-pointer font-medium", statusFilter === 'INACTIVE' && "bg-emerald-50 text-emerald-700 focus:bg-emerald-50")}>Inactive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 p-0 text-emerald-600 border-slate-200 bg-white hover:bg-emerald-50 transition-all shadow-sm"
            onClick={onRefresh}
            title="Refresh vendors"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 gap-1.5 px-3 cursor-pointer shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span>Columns</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] bg-white shadow-2xl border-slate-200 p-0 overflow-hidden z-[100]">
              <div className="p-3 bg-emerald-50/50 border-b border-slate-200/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Table Controls</h3>
                </div>
                <p className="text-[10px] text-emerald-600/70 leading-tight">Manage your workspace view and column preferences.</p>
              </div>

              <div className="max-h-[350px] overflow-auto custom-scrollbar p-2 space-y-3">
                {/* Visibility Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700/80">Visibility</span>
                  </div>
                  <div className="grid gap-0.5">
                    {table.getAllColumns()
                      .filter(col => col.getCanHide())
                      .map((column) => {
                        const label = column.id === 'name' ? 'Name' :
                                      column.id === 'email' ? 'Email' :
                                      column.id === 'phone' ? 'Phone' :
                                      column.id === 'balance' ? 'Balance' :
                                      column.id === 'status' ? 'Status' : column.id;
                        
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize text-xs rounded-md py-1.5 focus:bg-emerald-50 cursor-pointer"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {label}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </div>
                </div>

                <DropdownMenuSeparator className="opacity-50" />

                {/* Layout Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700/80">Layout & Interaction</span>
                  </div>
                  
                  <div className="px-2 space-y-2">
                    <div className="flex flex-col gap-1 p-2 rounded-md bg-emerald-50/50 border border-slate-200/50">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-800">
                        <MoreHorizontal className="h-3 w-3 text-emerald-600" />
                        <span>Interactive Controls</span>
                      </div>
                      <p className="text-[9px] text-emerald-600/70">Headers can be dragged to reorder and dragged at edges to resize.</p>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full h-8 text-[10px] font-bold tracking-tight rounded-md border-dashed hover:bg-emerald-50 hover:text-emerald-700 hover:border-slate-200 transition-all gap-2"
                      onClick={resetLayout}
                    >
                      <RotateCcw className="h-3 w-3" />
                      RESET TO DEFAULT
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="flex-1 overflow-auto relative custom-scrollbar flex flex-col bg-white min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <div style={{ minWidth: table.getTotalSize(), width: '100%' }} className="flex flex-col min-h-full">
            <div className="flex-1 text-sm flex flex-col" role="table">
              <div className="sticky top-0 z-20 flex flex-col" role="rowgroup">
                {table.getHeaderGroups().map((headerGroup) => (
                  <div key={headerGroup.id} className="flex bg-slate-50 border-b border-slate-200" role="row">
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </div>
                ))}
              </div>
              <div className="bg-white flex-1 flex flex-col" role="rowgroup">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      role="row"
                      className={cn(
                        "flex border-b border-slate-200 transition-colors hover:bg-slate-50 bg-white",
                        row.getIsSelected() && "bg-blue-50/20"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isActions = cell.column.id === 'actions';
                        const isSelect = cell.column.id === 'select';
                        const isResizable = cell.column.getCanResize();
                        return (
                          <div
                            key={cell.id}
                            role="cell"
                            className={cn(
                              "flex items-center px-3 py-2 border-r border-slate-200 last:border-r-0 h-12 overflow-hidden text-sm",
                              (isActions || isSelect) && "justify-center"
                            )}
                            style={{ 
                              width: cell.column.getSize(),
                              flex: isResizable ? `${cell.column.getSize()} 0 ${cell.column.getSize()}px` : `0 0 ${cell.column.getSize()}px`,
                              minWidth: cell.column.columnDef.minSize,
                              maxWidth: cell.column.columnDef.maxSize
                            }}
                          >
                            <div className={cn("w-full h-full flex items-center px-1 rounded-sm transition-colors", !isActions && !isSelect && "truncate", (isActions || isSelect) && "justify-center", cell.column.id === 'balance' && "font-mono font-medium text-foreground")}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 min-h-[200px] flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-emerald-600/40 w-full">
                       <FilterX className="h-12 w-12 mb-4 opacity-30" />
                       <p className="text-sm font-semibold">No vendors found</p>
                       <p className="text-xs">Adjust your search or filter to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-slate-50 border-t border-slate-200 flex mt-auto" role="row">
              {table.getVisibleLeafColumns().map((column) => {
                const isAmount = column.id === 'balance';
                const isSelect = column.id === 'select';
                const isResizable = column.getCanResize();
                return (
                  <div 
                    key={column.id} 
                    className={cn(
                      "px-3 py-2 flex items-center border-r border-slate-200 font-bold text-[10px] uppercase tracking-tight text-slate-500 last:border-r-0 h-10 overflow-hidden",
                      isAmount && "justify-end",
                      isSelect && "justify-center"
                    )}
                    style={{ 
                      width: column.getSize(),
                      flex: isResizable ? `${column.getSize()} 0 ${column.getSize()}px` : `0 0 ${column.getSize()}px`,
                      minWidth: column.columnDef.minSize,
                      maxWidth: column.columnDef.maxSize
                    }}
                  >
                    <span className="truncate">
                      {isAmount && formatCurrency(totalBalance, currency)}
                      {column.id === 'name' && 'TOTALS'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rows per page</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
          >
            {[10, 20, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Page <span className="text-gray-700">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="text-gray-700">{table.getPageCount() || 1}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

