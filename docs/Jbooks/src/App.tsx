/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  ChevronRight, 
  CreditCard, 
  FileSpreadsheet, 
  LayoutDashboard, 
  Settings, 
  Users,
  Bell,
  Search,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { AccountingTable } from '@/src/components/AccountingTable/AccountingTable';
import { MOCK_DATA } from '@/src/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function App() {
  const [activeTab, setActiveTab] = useState('transactions');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'transactions', icon: FileSpreadsheet, label: 'Transactions' },
    { id: 'invoices', icon: BookOpen, label: 'Invoices' },
    { id: 'expenses', icon: CreditCard, label: 'Expenses' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#FDFDFD] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold italic">J</span>
            </div>
            <span className="font-bold text-xl tracking-tight">JBooks</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground/70"
              )} />
              {item.label}
              {activeTab === item.id && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-2 border border-border/50">
             <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pro Plan</p>
             <p className="text-xs font-semibold">Haypbooks Enterprise</p>
             <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-primary h-full w-2/3" />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-full max-w-md hidden lg:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Universal search (cmd + K)" 
                  className="w-full bg-muted/30 border border-border/50 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full relative">
                <Bell className="h-4 w-4 " />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-card" />
             </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                <HelpCircle className="h-4 w-4" />
             </Button>
             
             <div className="h-8 w-px bg-border mx-2" />

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    role="button"
                    tabIndex={0}
                    className="flex items-center px-1.5 rounded-full gap-2 hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary/10">
                      PE
                    </div>
                    <div className="flex flex-col items-start hidden sm:flex">
                       <span className="text-xs font-semibold leading-none">Paul Escuadra</span>
                       <span className="text-[10px] text-muted-foreground">Admin</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#F9FAFB] p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Recent Transactions</h1>
              <p className="text-sm text-muted-foreground">Manage and track your company's financial flow through the ledger.</p>
            </div>

            {/* Table Container */}
            <div className="min-h-[600px] flex items-stretch">
              <AccountingTable data={MOCK_DATA} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
