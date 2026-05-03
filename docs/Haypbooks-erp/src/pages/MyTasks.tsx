import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  category: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review Q1 Financial Report',
    description: 'Verify all journal entries for the first quarter and prepare summary for the board.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-03-05',
    category: 'Accounting'
  },
  {
    id: '2',
    title: 'Approve Vendor Invoices',
    description: 'Review and approve pending invoices from Tech Logistics and Global Supplies.',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2026-03-02',
    category: 'Expenses'
  },
  {
    id: '3',
    title: 'Client Onboarding - Acme Corp',
    description: 'Set up chart of accounts and initial bank connections for the new client.',
    status: 'Pending',
    priority: 'High',
    dueDate: '2026-03-10',
    category: 'Accountant Workspace'
  },
  {
    id: '4',
    title: 'Monthly Payroll Sync',
    description: 'Ensure all employee hours are synced from the time tracking module.',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2026-02-28',
    category: 'Payroll'
  },
  {
    id: '5',
    title: 'Tax Filing Preparation',
    description: 'Gather all necessary documents for the upcoming VAT filing.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-03-15',
    category: 'Taxes'
  }
];

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  const filteredTasks = tasks.filter(task => filter === 'All' || task.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-50';
      case 'Medium': return 'text-amber-500 bg-amber-50';
      case 'Low': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'In Progress': return <Clock size={18} className="text-blue-500" />;
      case 'Pending': return <AlertCircle size={18} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            My <span className="text-brand-emerald-dark">Tasks</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your daily operations and approval workflows.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all">
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-morphism p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {['All', 'Pending', 'In Progress', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f 
                  ? 'bg-white text-brand-emerald-dark shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-emerald/50 transition-all"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group glass-morphism p-5 rounded-2xl hover:border-brand-emerald/30 transition-all hover:shadow-md cursor-pointer border border-slate-200/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  {getStatusIcon(task.status)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-emerald-dark transition-colors">
                      {task.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Calendar size={12} />
                      Due {task.dueDate}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Tag size={12} />
                      {task.category}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <User size={12} />
                      Assigned to Me
                    </div>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <MoreVertical size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-20 text-center glass-morphism rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">No tasks found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
