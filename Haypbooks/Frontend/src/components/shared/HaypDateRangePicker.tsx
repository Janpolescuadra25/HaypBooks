'use client'

import React, { useState, useEffect, useRef } from 'react'
import Popover from '@/components/Popover'
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
} from 'date-fns'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  ChevronDown 
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  range: DateRange
  onChange: (range: DateRange) => void
  onClose?: () => void
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
]

export default function HaypDateRangePicker({ range, onChange, onClose }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [tempRange, setTempRange] = useState<DateRange>(range)
  const [activePreset, setActivePreset] = useState('Today')
  const triggerRef = useRef<HTMLDivElement | null>(null)
  
  // Auto-close on scroll (only if main window scrolls, not internal lists)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      // If the scroll target is the window itself, close the popover
      if (isOpen && (e.target === window || e.target === document)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

  const handleDateClick = (date: Date) => {
    setActivePreset('Custom date')
    if (!tempRange.start || (tempRange.start && tempRange.end && !isSameDay(tempRange.start, tempRange.end))) {
      setTempRange({ start: date, end: date })
    } else if (isBefore(date, tempRange.start)) {
      setTempRange({ start: date, end: tempRange.start })
    } else {
      setTempRange({ ...tempRange, end: date })
    }
  }

  const renderCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="w-[240px]">
        <div className="flex items-center justify-center mb-5">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">
            {format(monthDate, 'MMMM yyyy')}
          </span>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
            <div key={day} className="text-[8px] font-black text-slate-400 text-center uppercase py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isStart = isSameDay(day, tempRange.start)
            const isEnd = isSameDay(day, tempRange.end)
            const isInRange = isWithinInterval(day, { 
              start: tempRange.start < tempRange.end ? tempRange.start : tempRange.end, 
              end: tempRange.start < tempRange.end ? tempRange.end : tempRange.start 
            })

            return (
              <div 
                key={idx}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative h-7 w-7 flex items-center justify-center cursor-pointer text-[10px] transition-all mx-auto group",
                  !isCurrentMonth ? "text-slate-300" : "text-slate-600 hover:text-slate-900",
                  isInRange && isCurrentMonth && !isStart && !isEnd ? "bg-emerald-500/5" : "",
                  (isStart || isEnd) && "z-10"
                )}
              >
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all",
                  (isStart || isEnd) ? "bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 scale-[0.8]" : "group-hover:bg-slate-50 rounded-full scale-75 opacity-0 group-hover:opacity-100"
                )} />
                <span className={cn(
                  "relative z-20 font-bold",
                  (isStart || isEnd) ? "text-white" : ""
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Connector */}
                {isInRange && isCurrentMonth && !isEnd && (
                  <div className="absolute right-[-50%] top-1/2 -translate-y-1/2 w-full h-5 bg-emerald-500/5 -z-0" />
                )}
                {isInRange && isCurrentMonth && !isStart && (
                  <div className="absolute left-[-50%] top-1/2 -translate-y-1/2 w-full h-5 bg-emerald-500/5 -z-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const handleApply = () => {
    onChange(tempRange)
    setIsOpen(false)
    onClose?.()
  }

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.label)
    const newRange = preset.getValue()
    if (newRange) {
      setTempRange(newRange)
    }
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onChange({ start: subDays(range.start, 1), end: subDays(range.end, 1) })}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div 
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm min-w-[260px] h-10"
        >
          <CalendarIcon size={16} className="text-slate-400" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              {activePreset}
            </span>
            <span className="text-[11px] font-bold text-slate-900 leading-none truncate">
              {format(range.start, 'MMM d, yyyy')} - {format(range.end, 'MMM d, yyyy')}
            </span>
          </div>
          <ChevronDown size={14} className={cn("ml-auto text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>

        <button 
          onClick={() => onChange({ start: addDays(range.start, 1), end: addDays(range.end, 1) })}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {isOpen && (
        <Popover open anchorRef={triggerRef} onClose={() => setIsOpen(false)} matchWidth={false} className="!z-[9999]">
          <AnimatePresence>
            <motion.div
              className="!bg-white !opacity-100 border border-slate-200 rounded-[24px] shadow-2xl z-[9999] flex flex-col md:flex-row min-w-[640px] max-w-[95vw] overflow-hidden ring-1 ring-black/5 !backdrop-blur-none"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Presets Sidebar */}
              <div className="w-40 border-r border-slate-100 py-5 bg-slate-50 flex flex-col h-[360px]">
                <div className="px-5 mb-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] shrink-0">
                  Quick Select
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                  {PRESETS.filter(p => p.label !== 'Custom date').map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-[10px] font-bold transition-all relative group rounded-xl mb-0.5",
                        activePreset === preset.label 
                          ? "text-emerald-600 bg-emerald-500/10" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      {preset.label}
                      {preset.getValue() && (
                        <span className="block text-[7px] text-slate-400 font-medium mt-0.5 group-hover:text-slate-500 transition-colors">
                          {format(preset.getValue()!.start, 'MMM d')} - {format(preset.getValue()!.end, 'MMM d')}
                        </span>
                      )}
                    </button>
                  ))}
                  
                  {activePreset === 'Custom date' && (
                    <div className="w-full text-left px-4 py-2.5 text-[10px] font-bold relative bg-emerald-500/10 text-emerald-600 rounded-xl">
                      Custom Range
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar Container */}
              <div className="flex-1 p-4 bg-white flex flex-col">
                <div className="flex gap-4 justify-center mb-4 flex-1">
                  {/* Left Calendar */}
                  <div className="relative">
                    <button 
                      onClick={handlePrevMonth} 
                      className="absolute -left-1 top-0 p-1 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {renderCalendar(viewDate)}
                  </div>
                  
                  {/* Right Calendar */}
                  <div className="relative">
                    <button 
                      onClick={handleNextMonth} 
                      className="absolute -right-1 top-0 p-1 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                    {renderCalendar(addMonths(viewDate, 1))}
                  </div>
                </div>

                {/* Bottom Inputs & Apply */}
                <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start date</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={format(tempRange.start, 'MM/dd/yyyy')}
                          onChange={(e) => {
                            const d = parse(e.target.value, 'MM/dd/yyyy', new Date())
                            if (isValid(d)) setTempRange({ ...tempRange, start: d })
                          }}
                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="w-2 h-[1px] bg-slate-200 mt-4" />
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">End date</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={format(tempRange.end, 'MM/dd/yyyy')}
                          onChange={(e) => {
                            const d = parse(e.target.value, 'MM/dd/yyyy', new Date())
                            if (isValid(d)) setTempRange({ ...tempRange, end: d })
                          }}
                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Popover>
      )}
    </div>
  )
}
