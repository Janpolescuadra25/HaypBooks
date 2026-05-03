import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  CheckCircle, 
  Building2, 
  Landmark, 
  ShoppingCart, 
  Receipt, 
  Package, 
  FolderKanban, 
  Clock, 
  Users, 
  FileText, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Briefcase, 
  CreditCard, 
  Blocks, 
  Settings
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'home': Home,
  'check-circle': CheckCircle,
  'building-2': Building2,
  'landmark': Landmark,
  'shopping-cart': ShoppingCart,
  'receipt': Receipt,
  'package': Package,
  'folder-kanban': FolderKanban,
  'clock': Clock,
  'users': Users,
  'file-text': FileText,
  'book-open': BookOpen,
  'bar-chart-3': BarChart3,
  'shield-check': ShieldCheck,
  'zap': Zap,
  'briefcase': Briefcase,
  'credit-card': CreditCard,
  'blocks': Blocks,
  'settings': Settings,
};

const navigationData = [
  {
    "module": "HOME",
    "icon": "home",
    "items": ["Dashboard", "Notifications", "Business Health", "Shortcuts"]
  },
  {
    "module": "TASKS & APPROVALS",
    "icon": "check-circle",
    "subgroups": {
      "My Work": ["My Tasks", "My Approvals", "My Exceptions", "Overdue Items"],
      "Management": ["Team Tasks", "Delegated Tasks", "Approval Queue"],
      "History": ["Completed Tasks", "Approval History"]
    }
  },
  {
    "module": "ORGANIZATION",
    "icon": "building-2",
    "ent_tag": true,
    "subgroups": {
      "Entity Structure": ["Legal Entities", "Intercompany Transactions", "Consolidation"],
      "Operational Structure": ["Locations & Divisions", "Departments", "Org Chart"],
      "Governance": ["Filing Calendar", "Document Storage"]
    }
  },
  {
    "module": "BANKING & CASH",
    "icon": "landmark",
    "subgroups": {
      "Bank Connections": ["Connected Banks", "Bank Feeds", "Sync Logs", "Statement Import"],
      "Transactions": ["Bank Transactions", "App Transactions", "Transaction Rules"],
      "Reconciliation": ["Reconcile", "Reconciliation History", "Statement Archive"],
      "Cash Accounts": ["Bank Accounts", "Petty Cash", "Undeposited Funds"],
      "Cash Management": ["Cash Position", "Short-Term Forecast", "Cash Flow Projection"],
      "Treasury": ["Intercompany Transfers", "Internal Loans", "Credit Lines"]
    }
  },
  {
    "module": "SALES",
    "icon": "shopping-cart",
    "subgroups": {
      "Customers": ["Customers", "Customer Groups", "Price Lists"],
      "Sales Operations": ["Products & Services", "Quotes & Estimates", "Sales Orders"],
      "Billing": ["Invoices", "Recurring Invoices", "Credit Notes", "Payment Links"],
      "Collections": ["Customer Payments", "A/R Aging", "Collections Center"],
      "Revenue Management": ["Revenue Recognition", "Deferred Revenue", "Subscription Billing"],
      "Sales Insights": ["Sales Performance", "Revenue Trends"]
    }
  },
  {
    "module": "EXPENSES",
    "icon": "receipt",
    "subgroups": {
      "Vendors": ["Vendors", "Vendor Documents", "Contractor Management"],
      "Purchasing": ["Purchase Requests", "Purchase Orders", "Approval Workflows"],
      "Expense Capture": ["Expenses", "Receipts", "Mileage", "Employee Reimbursements"],
      "Payables": ["Bills", "Recurring Bills", "Bill Payments", "A/P Aging", "Payment Runs"],
      "Expense Insights": ["Spend Analysis", "Vendor Spend", "Cost Allocation"]
    }
  },
  {
    "module": "INVENTORY",
    "icon": "package",
    "subgroups": {
      "Setup": ["Inventory Items", "Categories", "Units of Measure"],
      "Stock Operations": ["Stock Movements", "Inventory Adjustments", "Cycle Counts"],
      "Warehousing": ["Warehouses", "Bin Locations", "Stock Zones"],
      "Control": ["Reorder Points", "Safety Stock", "Lot Tracking"],
      "Valuation": ["Inventory Valuation", "Cost Adjustments", "COGS Analysis"]
    }
  },
  {
    "module": "PROJECTS",
    "icon": "folder-kanban",
    "subgroups": {
      "Project Setup": ["Projects", "Templates", "Milestones", "Budgets"],
      "Planning": ["Tasks", "Schedule", "Resource Planning"],
      "Tracking": ["Project Time", "Project Expenses", "Billable Review"],
      "Billing": ["Project Billing", "Progress Billing", "Retainers", "WIP"],
      "Financials": ["Project Profitability", "Budget vs Actual"]
    }
  },
  {
    "module": "TIME",
    "icon": "clock",
    "items": ["Time Entries", "Timesheets", "Timer", "Billable Time Review"]
  },
  {
    "module": "PAYROLL & WORKFORCE",
    "icon": "users",
    "subgroups": {
      "Workforce": ["Employees", "Contracts", "Job Positions"],
      "Time & Leave": ["Leave Requests", "Leave Balances", "Shift Scheduling"],
      "Payroll Processing": ["Payroll Runs", "Off-Cycle Payroll", "Payroll History"],
      "Compensation": ["Salary Structures", "Allowances", "Benefit Plans"],
      "Payroll Taxes": ["Tax Withholding", "Government Contributions"]
    }
  },
  {
    "module": "TAXES",
    "icon": "file-text",
    "subgroups": {
      "Tax Setup": ["Tax Rates", "Tax Codes", "Agencies"],
      "Sales Tax": ["VAT / Sales Tax", "Zero-Rated Sales", "Output Tax Ledger"],
      "Purchase Tax": ["Input VAT", "Withholding Tax"],
      "Filing": ["Tax Returns", "Filing History", "Payments"]
    }
  },
  {
    "module": "TAXES",
    "icon": "file-text",
    "subgroups": {
      "Tax Setup": ["Tax Rates", "Tax Codes", "Agencies"],
      "Sales Tax": ["VAT / Sales Tax", "Zero-Rated Sales", "Output Tax Ledger"],
      "Purchase Tax": ["Input VAT", "Withholding Tax"],
      "Filing": ["Tax Returns", "Filing History", "Payments"]
    }
  },
  {
    "module": "ACCOUNTING",
    "icon": "book-open",
    "subgroups": {
      "Core Accounting": ["Chart of Accounts", "Journal Entries", "General Ledger", "Trial Balance"],
      "Fixed Assets": ["Asset Register", "Depreciation", "Disposals"],
      "Period Close": ["Close Checklist", "Reconciliations", "Lock Period"]
    }
  },
  {
    "module": "REPORTING",
    "icon": "bar-chart-3",
    "items": ["Financial Statements", "Standard Reports", "Custom Reports", "Performance Center"]
  },
  {
    "module": "COMPLIANCE",
    "icon": "shield-check",
    "ent_tag": true,
    "items": ["Internal Controls", "Control Testing", "Issue Tracking", "SOX Compliance"]
  },
  {
    "module": "AUTOMATION",
    "icon": "zap",
    "items": ["Workflow Builder", "Approval Flows", "Smart Rules", "AI Bookkeeping"]
  },
  {
    "module": "ACCOUNTANT WORKSPACE",
    "icon": "briefcase",
    "items": ["Client Overview", "Books Review", "Reconciliation Hub", "Adjusting Entries"]
  },
  {
    "module": "FINANCIAL SERVICES",
    "icon": "credit-card",
    "items": ["Business Checking", "Line of Credit", "Business Loans", "Credit Health Score"]
  },
  {
    "module": "APPS & INTEGRATIONS",
    "icon": "blocks",
    "items": ["App Marketplace", "Connected Apps", "API Access", "Import/Export"]
  },
  {
    "module": "SETTINGS",
    "icon": "settings",
    "subgroups": {
      "Account": ["Subscription", "Billing History"],
      "Users": ["User Management", "Roles & Permissions"],
      "Preferences": ["Custom Fields", "Templates", "Notifications"]
    }
  }
];

export default function SideNav({ onNavigate, activePage }: { onNavigate?: (page: string) => void, activePage?: string }) {
  const [activeModule, setActiveModule] = useState('HOME');

  const activeModuleData = navigationData.find(nav => nav.module === activeModule);

  const handleItemClick = (item: string) => {
    if (['Dashboard', 'My Tasks', 'Business Health', 'Shortcuts', 'Invoices', 'Vendors', 'Journal Entries', 'General Ledger'].includes(item)) {
      onNavigate?.(item);
    }
  };

  return (
    <div className="fixed left-0 top-16 bottom-0 z-40 flex">
      {/* Primary Sidebar - Icons Only */}
      <aside className="w-[80px] bg-slate-900 flex flex-col items-center py-6 gap-4 border-r border-white/5 shadow-2xl overflow-y-auto no-scrollbar">
        {navigationData.map((nav) => {
          const Icon = iconMap[nav.icon] || Home;
          const isActive = activeModule === nav.module;

          return (
            <button
              key={nav.module}
              onClick={() => {
                setActiveModule(nav.module);
                if (nav.module === 'HOME') {
                  onNavigate?.('Dashboard');
                }
              }}
              className={`relative group p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={24} className="shrink-0" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-2xl border border-white/5 uppercase tracking-widest">
                {nav.module}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-emerald rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </aside>

      {/* Secondary Sidebar - Sub-items */}
      <aside className="w-[240px] bg-white/80 backdrop-blur-3xl border-r border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Module</h2>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">{activeModule}</h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-6 py-4">
          {activeModuleData?.items && (
            <div className="space-y-1">
              {activeModuleData.items.map(item => (
                <button 
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left py-2.5 px-4 text-sm rounded-xl transition-all flex items-center justify-between group ${
                    activePage === item 
                      ? 'text-brand-emerald-dark bg-brand-emerald/10 font-bold shadow-sm' 
                      : 'text-slate-500 hover:text-brand-emerald-dark hover:bg-slate-50'
                  }`}
                >
                  {item}
                  {activePage === item && <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />}
                </button>
              ))}
            </div>
          )}

          {activeModuleData?.subgroups && Object.entries(activeModuleData.subgroups).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
                {groupName}
              </div>
              <div className="space-y-0.5">
                {(groupItems as string[]).map(item => (
                  <button 
                    key={item}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left py-2 px-4 text-xs rounded-xl transition-all flex items-center justify-between group ${
                      activePage === item 
                        ? 'text-brand-emerald-dark bg-brand-emerald/10 font-bold' 
                        : 'text-slate-500 hover:text-brand-emerald-dark hover:bg-slate-50'
                    }`}
                  >
                    {item}
                    {activePage === item && <div className="w-1 h-1 rounded-full bg-brand-emerald" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User Status in Secondary Sidebar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald-dark font-bold text-sm">
              JP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">John Paul</p>
              <p className="text-[10px] text-slate-500 truncate">Senior Architect</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
