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
  Plus, 
  FilterX,
  FileText,
  Copy,
  Archive,
  Download,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter
} from 'lucide-react';

import { AccountingTransaction, TransactionStatus } from '@/src/types';
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY = 'haypbooks_table_config';

interface AccountingTableProps {
  data: AccountingTransaction[];
}

export function AccountingTable({ data }: AccountingTableProps) {
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnSizing, setColumnSizing] = useState(savedConfig?.columnSizing || {});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const columns = useMemo<ColumnDef<AccountingTransaction>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center w-full">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 40,
      minSize: 40,
    },
    {
      accessorKey: 'date',
      id: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.date || '—'}</span>,
      size: 100,
      minSize: 80,
    },
    {
      accessorKey: 'reference',
      id: 'reference',
      header: 'Reference',
      cell: ({ row }) => <span className="font-medium text-foreground text-xs">{row.original.reference || '—'}</span>,
      size: 110,
      minSize: 90,
    },
    {
      accessorKey: 'entity',
      id: 'entity',
      header: 'Entity / Vendor',
      cell: ({ row }) => <span className="text-xs">{row.original.entity || '—'}</span>,
      size: 160,
      minSize: 120,
    },
    {
      accessorKey: 'category',
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.category || '—'}</span>,
      size: 140,
      minSize: 100,
    },
    {
      accessorKey: 'amount',
      id: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: row.original.currency,
        }).format(amount);
 
        return <div className="text-right font-mono font-medium text-xs">{formatted}</div>;
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as TransactionStatus;
        return (
          <div className="flex items-center">
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize text-[10px] px-2 py-0 h-5 border-none font-bold tracking-tight",
                status === 'paid' && "bg-emerald-500/10 text-emerald-700",
                status === 'pending' && "bg-amber-500/10 text-amber-700",
                status === 'overdue' && "bg-rose-500/10 text-rose-700",
                status === 'draft' && "bg-zinc-500/10 text-zinc-700"
              )}
            >
              {status}
            </Badge>
          </div>
        );
      },
      size: 110,
      minSize: 80,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const handleDelete = () => {
          if (confirm(`Are you sure you want to delete transaction ${row.original.reference}?`)) {
            console.log('Deleting row:', row.original.id);
            // Implement delete logic
          }
        };

        const handleDuplicate = () => {
          console.log('Duplicating row:', row.original.id);
          // Implement duplicate logic
        };

        const handleArchive = () => {
          console.log('Archiving row:', row.original.id);
          // Implement archive logic
        };

        const handleExportRow = () => {
          console.log('Exporting row:', row.original.id);
          // Implement single row export
        };

        return (
          <div className="flex items-center justify-center gap-1 w-full">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                onClick={() => console.log('Editing row:', row.original.id)}
                title="Edit Entry"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-2xl border-border/50 p-1">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5">Row Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                
                <DropdownMenuItem className="text-xs py-2 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                  <FileText className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">View Details</span>
                    <span className="text-[9px] text-muted-foreground">Detailed transaction logs</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer transition-colors"
                  onClick={handleDuplicate}
                >
                  <Copy className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Duplicate Entry</span>
                    <span className="text-[9px] text-muted-foreground">Clone this record</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer transition-colors"
                  onClick={handleArchive}
                >
                  <Archive className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Archive</span>
                    <span className="text-[9px] text-muted-foreground">Move to historical records</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="opacity-50" />

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer transition-colors"
                  onClick={handleExportRow}
                >
                  <Download className="mr-2.5 h-4 w-4 opacity-70" /> 
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Export as PDF</span>
                    <span className="text-[9px] text-muted-foreground">Single row summary</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="opacity-50" />

                <DropdownMenuItem 
                  className="text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors font-semibold"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2.5 h-4 w-4 opacity-100" /> 
                  <div className="flex flex-col gap-0.5">
                    <span>Delete Permanently</span>
                    <span className="text-[9px] opacity-70 font-normal">Action cannot be undone</span>
                  </div>
                </DropdownMenuItem>
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
  ], []);

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
    setColumnOrder(columns.map((c) => (c.id as string) || (c.accessorKey as string)));
    setColumnVisibility({});
    setColumnSizing({});
    setSorting([]);
    setGlobalFilter('');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Initialize column order if empty
  useEffect(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(columns.map((c) => (c.id as string) || (c.accessorKey as string)));
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
  const totalAmount = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((sum, row) => {
      return sum + parseFloat(row.getValue('amount') as string);
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

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden border border-border shadow-sm rounded-xl">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter transactions..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-muted/30 border-border/50 h-9 text-xs"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 gap-1.5 px-3 cursor-pointer">
              <Settings2 className="h-4 w-4" />
              <span>Columns</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] shadow-2xl border-border/50 p-0 overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Table Controls</h3>
                  <Badge variant="outline" className="text-[9px] px-1 h-4 bg-primary/5 text-primary border-primary/20">Config</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">Manage your workspace view and column preferences.</p>
              </div>

              <div className="max-h-[350px] overflow-auto custom-scrollbar p-2 space-y-3">
                {/* Visibility Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">Visibility</span>
                  </div>
                  <div className="grid gap-0.5">
                    {table.getAllColumns()
                      .filter(col => col.getCanHide())
                      .map((column) => {
                        const label = column.id === 'entity' ? 'Entity / Vendor' :
                                      column.id === 'reference' ? 'Reference No.' :
                                      column.id === 'category' ? 'Category' :
                                      column.id === 'amount' ? 'Amount' :
                                      column.id === 'status' ? 'Status' :
                                      column.id === 'date' ? 'Date' : column.id;
                        
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize text-xs rounded-md py-1.5 focus:bg-accent/50 cursor-pointer"
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
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">Layout & Interaction</span>
                  </div>
                  
                  <div className="px-2 space-y-2">
                    <div className="flex flex-col gap-1 p-2 rounded-md bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-foreground/80">
                        <MoreHorizontal className="h-3 w-3 text-primary" />
                        <span>Interactive Controls</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Headers can be dragged to reorder and dragged at edges to resize.</p>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full h-8 text-[10px] font-bold tracking-tight rounded-md border-dashed hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all gap-2"
                      onClick={resetLayout}
                    >
                      <RotateCcw className="h-3 w-3" />
                      RESET TO DEFAULT
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-2 border-t border-border/50 bg-muted/50 flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground font-medium italic">Changes auto-saved</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full animate-in fade-in zoom-in-95">
              <span className="text-[11px] font-bold text-primary">{selectedCount} Selected</span>
              <div className="w-[1px] h-3 bg-primary/20" />
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/20">
                Process
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 p-0 text-muted-foreground border-border/50 bg-background hover:bg-muted hover:text-foreground transition-all shadow-sm"
            onClick={() => window.location.reload()}
            title="Refresh transactions"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-1.5 px-3 text-xs font-medium border-border/50 bg-background hover:bg-muted transition-all shadow-sm"
            onClick={() => {
              console.log('Exporting data...');
              // Implement export logic here
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="flex-1 overflow-auto relative custom-scrollbar flex flex-col bg-card/50">
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
                  <div key={headerGroup.id} className="flex bg-muted/95 backdrop-blur-md border-b border-border/50" role="row">
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
              <div className="bg-card flex-1 flex flex-col" role="rowgroup">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      role="row"
                      className={cn(
                        "flex border-b border-border/50 transition-colors hover:bg-muted/50 bg-background",
                        row.getIsSelected() && "bg-muted/30"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isActions = cell.column.id === 'actions';
                        const isSelect = cell.column.id === 'select';
                        return (
                          <div
                            key={cell.id}
                            role="cell"
                            className={cn(
                              "flex items-center px-3 py-2 border-r border-border/50 last:border-r-0 h-12 overflow-hidden",
                              (isActions || isSelect) && "justify-center"
                            )}
                            style={{ 
                              width: cell.column.getSize(),
                              flex: `0 0 ${cell.column.getSize()}px`,
                              minWidth: cell.column.columnDef.minSize,
                              maxWidth: cell.column.columnDef.maxSize
                            }}
                          >
                            <div className={cn("w-full h-full flex items-center px-1 rounded-sm transition-colors", !isActions && !isSelect && "truncate", (isActions || isSelect) && "justify-center", cell.column.id === 'amount' && "font-mono font-medium text-foreground")}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 min-h-[400px]">
                    <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full">
                       <FilterX className="h-12 w-12 mb-4 opacity-10" />
                       <p className="text-sm font-semibold">No transactions found</p>
                       <p className="text-xs">Adjust your search or filter to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-muted/90 backdrop-blur-md border-t border-border/50 flex mt-auto" role="row">
              {table.getVisibleLeafColumns().map((column) => {
                const isAmount = column.id === 'amount';
                const isSelect = column.id === 'select';
                return (
                  <div 
                    key={column.id} 
                    className={cn(
                      "px-3 py-2 flex items-center border-r border-border/50 font-bold text-[10px] uppercase tracking-tight text-muted-foreground last:border-r-0 h-10 overflow-hidden",
                      isAmount && "justify-end",
                      isSelect && "justify-center"
                    )}
                    style={{ 
                      width: column.getSize(),
                      flex: `0 0 ${column.getSize()}px`,
                      minWidth: column.columnDef.minSize,
                      maxWidth: column.columnDef.maxSize
                    }}
                  >
                    <span className="truncate">
                      {isAmount && new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
                      {column.id === 'date' && 'TOTALS'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight opacity-70">Rows per page</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-background border border-border rounded px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight opacity-70">
            Page <span className="text-foreground opacity-100">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="text-foreground opacity-100">{table.getPageCount()}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground border-border bg-background hover:bg-accent transition-all shadow-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground border-border bg-background hover:bg-accent transition-all shadow-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground border-border bg-background hover:bg-accent transition-all shadow-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground border-border bg-background hover:bg-accent transition-all shadow-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
