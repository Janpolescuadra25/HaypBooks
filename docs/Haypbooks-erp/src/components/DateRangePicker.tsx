import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval, 
  isWithinInterval,
  subDays,
  startOfToday,
  startOfYesterday,
  subWeeks,
  isValid,
  parse,
  isBefore,
  isAfter
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS = [
  { label: 'Today', getValue: () => ({ start: startOfToday(), end: startOfToday() }) },
  { label: 'Yesterday', getValue: () => ({ start: startOfYesterday(), end: startOfYesterday() }) },
  { label: 'This week', getValue: () => ({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) }) },
  { label: 'Last week', getValue: () => ({ start: startOfWeek(subWeeks(new Date(), 1)), end: endOfWeek(subWeeks(new Date(), 1)) }) },
  { label: 'Last 7 days', getValue: () => ({ start: subDays(new Date(), 6), end: new Date() }) },
  { label: 'This month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Last month', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Custom date', getValue: () => null },
];

export default function DateRangePicker({ range, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [tempRange, setTempRange] = useState<DateRange>(range);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState('Today');

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDateClick = (date: Date) => {
    setActivePreset('Custom date');
    if (!tempRange.start || (tempRange.start && tempRange.end && !isSameDay(tempRange.start, tempRange.end))) {
      setTempRange({ start: date, end: date });
    } else if (isBefore(date, tempRange.start)) {
      setTempRange({ start: date, end: tempRange.start });
    } else {
      setTempRange({ ...tempRange, end: date });
    }
  };

  const renderCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="w-80">
        <div className="flex items-center justify-center mb-6">
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
            {format(monthDate, 'MMMM yyyy')}
          </span>
        </div>
        <div className="grid grid-cols-7 mb-4">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-[10px] font-black text-slate-400 text-center uppercase py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isStart = isSameDay(day, tempRange.start);
            const isEnd = isSameDay(day, tempRange.end);
            const isInRange = isWithinInterval(day, { 
              start: tempRange.start < tempRange.end ? tempRange.start : tempRange.end, 
              end: tempRange.start < tempRange.end ? tempRange.end : tempRange.start 
            });

            return (
              <div 
                key={idx}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-10 w-10 flex items-center justify-center cursor-pointer text-xs transition-all mx-auto
                  ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-50 rounded-full'}
                  ${isInRange && isCurrentMonth && !isStart && !isEnd ? 'bg-brand-emerald/5' : ''}
                  ${isStart || isEnd ? 'bg-brand-emerald text-white rounded-full shadow-lg shadow-brand-emerald/20' : ''}
                `}
              >
                <span className="relative z-10 font-medium">{format(day, 'd')}</span>
                {/* Connector for range */}
                {isInRange && isCurrentMonth && !isEnd && (
                  <div className="absolute right-[-50%] top-1/2 -translate-y-1/2 w-full h-8 bg-brand-emerald/5 -z-0" />
                )}
                {isInRange && isCurrentMonth && !isStart && (
                  <div className="absolute left-[-50%] top-1/2 -translate-y-1/2 w-full h-8 bg-brand-emerald/5 -z-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.label);
    const newRange = preset.getValue();
    if (newRange) {
      setTempRange(newRange);
      // We don't automatically close if user wants to tweak it
    }
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onChange({ start: subDays(range.start, 1), end: subDays(range.end, 1) })}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-brand-emerald/30 transition-all shadow-sm min-w-[280px]"
        >
          <CalendarIcon size={18} className="text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {activePreset}
            </span>
            <span className="text-xs font-bold text-slate-900 leading-none">
              {format(range.start, 'MMM d, yyyy')} - {format(range.end, 'MMM d, yyyy')}
            </span>
          </div>
          <ChevronDown size={16} className={`ml-auto text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <button 
          onClick={() => onChange({ start: addDays(range.start, 1), end: addDays(range.end, 1) })}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 lg:left-0 mt-2 bg-white border border-slate-200 rounded-[32px] shadow-2xl z-[100] flex flex-col md:flex-row min-w-[720px] max-w-[95vw]"
            >
              {/* Presets Sidebar */}
              <div className="w-52 border-r border-slate-100 py-6 bg-slate-50/50 flex flex-col h-[400px]">
                <div className="px-6 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                  Quick Select
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {PRESETS.filter(p => p.label !== 'Custom date').map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className={`
                        w-full text-left px-6 py-3 text-xs font-bold transition-all relative group
                        ${activePreset === preset.label 
                          ? 'text-brand-emerald bg-brand-emerald/10' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }
                      `}
                    >
                      {activePreset === preset.label && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-emerald" />
                      )}
                      {preset.label}
                      {preset.getValue() && (
                        <span className="block text-[9px] text-slate-400 font-medium mt-0.5 group-hover:text-slate-500 transition-colors">
                          {format(preset.getValue()!.start, 'MMM d')} - {format(preset.getValue()!.end, 'MMM d')}
                        </span>
                      )}
                    </button>
                  ))}
                  
                  {/* Custom Date indicator appears only when active */}
                  {activePreset === 'Custom date' && (
                    <div className="w-full text-left px-6 py-3 text-xs font-bold relative bg-brand-emerald/10 text-brand-emerald">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-emerald" />
                      Custom Range
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar Container */}
              <div className="flex-1 p-8 bg-white">
                <div className="flex gap-12 justify-center mb-6">
                  {/* Left Calendar */}
                  <div className="relative">
                    <button 
                      onClick={handlePrevMonth} 
                      className="absolute -left-2 top-0 p-2 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {renderCalendar(viewDate)}
                  </div>
                  
                  {/* Right Calendar */}
                  <div className="relative">
                    <button 
                      onClick={handleNextMonth} 
                      className="absolute -right-2 top-0 p-2 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                    {renderCalendar(addMonths(viewDate, 1))}
                  </div>
                </div>

                {/* Bottom Inputs & Apply */}
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start date</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={format(tempRange.start, 'MM/dd/yyyy')}
                          onChange={(e) => {
                            const d = parse(e.target.value, 'MM/dd/yyyy', new Date());
                            if (isValid(d)) setTempRange({ ...tempRange, start: d });
                          }}
                          className="w-36 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/5 transition-all"
                        />
                      </div>
                    </div>
                    <div className="w-4 h-[1px] bg-slate-200 mt-5" />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End date</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={format(tempRange.end, 'MM/dd/yyyy')}
                          onChange={(e) => {
                            const d = parse(e.target.value, 'MM/dd/yyyy', new Date());
                            if (isValid(d)) setTempRange({ ...tempRange, end: d });
                          }}
                          className="w-36 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      className="px-10 py-2.5 bg-brand-emerald text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-emerald/25 hover:scale-105 active:scale-95 transition-all"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
