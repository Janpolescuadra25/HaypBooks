import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Command, 
  Search, 
  Keyboard, 
  MousePointer2, 
  Zap, 
  Printer,
  SearchIcon,
  Plus,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Users,
  Settings
} from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // General
  { keys: ['⌘', 'K'], description: 'Global Search', category: 'General' },
  { keys: ['⌘', '/'], description: 'Show Shortcuts', category: 'General' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'General' },
  { keys: ['?'], description: 'Help Center', category: 'General' },
  
  // Navigation
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['G', 'T'], description: 'Go to My Tasks', category: 'Navigation' },
  { keys: ['G', 'H'], description: 'Go to Business Health', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },
  { keys: ['['], description: 'Toggle Sidebar', category: 'Navigation' },
  
  // Actions
  { keys: ['N'], description: 'Quick Create Menu', category: 'Actions' },
  { keys: ['⌘', 'S'], description: 'Save Changes', category: 'Actions' },
  { keys: ['⌘', 'P'], description: 'Print Document', category: 'Actions' },
  { keys: ['⌘', 'E'], description: 'Export Data', category: 'Actions' },
  { keys: ['R'], description: 'Refresh Data', category: 'Actions' },

  // Module Specific
  { keys: ['I'], description: 'New Invoice', category: 'Modules' },
  { keys: ['B'], description: 'New Bill', category: 'Modules' },
  { keys: ['C'], description: 'New Customer', category: 'Modules' },
  { keys: ['V'], description: 'New Vendor', category: 'Modules' },
  { keys: ['J'], description: 'New Journal Entry', category: 'Modules' },
];

export default function Shortcuts() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredShortcuts = shortcuts.filter(s => 
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Keyboard <span className="text-brand-emerald-dark">Shortcuts</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Boost your productivity with these powerful key combinations.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-emerald/30 transition-all shadow-sm">
            <Printer size={18} />
            Print Guide
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for a shortcut..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-emerald/50 focus:ring-4 focus:ring-brand-emerald/5 transition-all shadow-sm"
        />
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map((category, catIdx) => {
          const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
          if (categoryShortcuts.length === 0) return null;

          return (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
              className="glass-morphism rounded-[32px] p-8 border border-slate-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald-dark">
                  {category === 'General' && <Keyboard size={20} />}
                  {category === 'Navigation' && <MousePointer2 size={20} />}
                  {category === 'Actions' && <Zap size={20} />}
                  {category === 'Modules' && <Plus size={20} />}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{category}</h2>
              </div>

              <div className="space-y-4">
                {categoryShortcuts.map((shortcut, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                  >
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1.5">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd 
                          key={keyIdx}
                          className="min-w-[24px] h-7 px-2 flex items-center justify-center bg-white border border-slate-200 border-b-4 rounded-lg text-[11px] font-black text-slate-500 shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-8 glass-morphism rounded-[32px] bg-brand-emerald/5 border border-brand-emerald/10">
        <h3 className="text-lg font-bold text-brand-emerald-dark mb-4 flex items-center gap-2">
          <Zap size={20} />
          Pro Tip
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          You can combine navigation shortcuts for even faster access. For example, pressing <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">G</kbd> then <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">D</kbd> will instantly take you to the Dashboard from anywhere in the application.
        </p>
      </div>
    </div>
  );
}
