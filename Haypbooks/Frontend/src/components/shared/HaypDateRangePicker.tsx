'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,
  eachDayOfInterval, isWithinInterval, subDays, startOfToday,
  startOfYesterday, subWeeks, isValid, parse, isBefore,
} from 'date-fns'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown
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
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | null>(null)
  const [startInput, setStartInput] = useState(() => format(range.start, 'MM/dd/yyyy'))
  const [endInput, setEndInput] = useState(() => format(range.end, 'MM/dd/yyyy'))

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const panelWidth = 640
    const padding = 16
    const offset = 8
    let left = rect.left
    left = Math.max(padding, Math.min(left, viewportWidth - panelWidth - padding))
    const panelHeight = panelRef.current?.offsetHeight || 0
    let top: number
    if (panelHeight > 0 && rect.bottom + offset + panelHeight > viewportHeight && rect.top - offset - panelHeight >= padding) {
      top = rect.top - panelHeight - offset
    } else {
      top = rect.bottom + offset
    }
    setPanelStyle({
      position: 'fixed',
      left,
      top,
      zIndex: 9999,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) { setPanelStyle(null); return }
    let rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updatePanelPosition)
    })
    window.addEventListener('resize', updatePanelPosition)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updatePanelPosition)
    }
  }, [isOpen, updatePanelPosition])

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isOpen && (e.target === window || e.target === document)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (triggerRef.current && triggerRef.current.contains(t)) return
      const panel = document.getElementById('hayp-date-range-panel')
      if (panel && panel.contains(t)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen])

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

  const handleDateClick = (date: Date) => {
    setActivePreset('Custom date')
    let newRange: DateRange
    if (!tempRange.start || (tempRange.start && tempRange.end && !isSameDay(tempRange.start, tempRange.end))) {
      newRange = { start: date, end: date }
    } else if (isBefore(date, tempRange.start)) {
      newRange = { start: date, end: tempRange.start }
    } else {
      newRange = { ...tempRange, end: date }
    }
    setTempRange(newRange)
    setStartInput(format(newRange.start, 'MM/dd/yyyy'))
    setEndInput(format(newRange.end, 'MM/dd/yyyy'))
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
            <div key={day} className="text-[8px] font-black text-slate-400 text-center uppercase py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isStart = isSameDay(day, tempRange.start)
            const isEnd = isSameDay(day, tempRange.end)
            const isSingleDay = isSameDay(tempRange.start, tempRange.end)
            const isInRange = isWithinInterval(day, {
              start: tempRange.start < tempRange.end ? tempRange.start : tempRange.end,
              end: tempRange.start < tempRange.end ? tempRange.end : tempRange.start,
            })
            return (
              <div key={idx} onClick={() => handleDateClick(day)}
                className={cn(
                  "relative h-8 w-full flex items-center justify-center cursor-pointer text-[10px] transition-all group",
                  !isCurrentMonth ? "text-slate-300" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {/* Full-width band for interior in-range days */}
                {isInRange && isCurrentMonth && !isStart && !isEnd && (
                  <div className="absolute inset-y-1 inset-x-0 bg-emerald-50" />
                )}
                {/* Right-half band extending from start day */}
                {isStart && isCurrentMonth && !isSingleDay && (
                  <div className="absolute inset-y-1 left-1/2 right-0 bg-emerald-50" />
                )}
                {/* Left-half band extending to end day */}
                {isEnd && isCurrentMonth && !isSingleDay && (
                  <div className="absolute inset-y-1 left-0 right-1/2 bg-emerald-50" />
                )}
                {/* Day circle */}
                <div className={cn(
                  "relative z-10 h-7 w-7 flex items-center justify-center rounded-full transition-all",
                  (isStart || isEnd) && isCurrentMonth
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "group-hover:bg-slate-100"
                )}>
                  <span className={cn(
                    "font-bold",
                    (isStart || isEnd) && isCurrentMonth ? "text-white" : ""
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
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
      setStartInput(format(newRange.start, 'MM/dd/yyyy'))
      setEndInput(format(newRange.end, 'MM/dd/yyyy'))
    }
  }

  const calendarPanel = (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
          <motion.div
            ref={panelRef}
            id="hayp-date-range-panel"
            style={panelStyle ?? { position: 'fixed' as const, left: -9999, top: -9999 }}
            className="!bg-white !opacity-100 border border-slate-200 rounded-[24px] shadow-2xl flex flex-col md:flex-row w-[calc(100vw-2rem)] sm:w-[640px] max-w-[95vw] overflow-hidden ring-1 ring-black/5 !backdrop-blur-none"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-40 border-r border-slate-100 py-5 bg-slate-50 flex flex-col h-[360px]">
              <div className="px-5 mb-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] shrink-0">Quick Select</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                {PRESETS.filter(p => p.label !== 'Custom date').map((preset) => (
                  <button key={preset.label} onClick={() => handlePresetClick(preset)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-[10px] font-bold transition-all relative group rounded-xl mb-0.5",
                      activePreset === preset.label ? "text-emerald-600 bg-emerald-500/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
                  <div className="w-full text-left px-4 py-2.5 text-[10px] font-bold relative bg-emerald-500/10 text-emerald-600 rounded-xl">Custom Range</div>
                )}
              </div>
            </div>
            <div className="flex-1 p-4 bg-white flex flex-col">
              <div className="flex gap-4 justify-center mb-4 flex-1">
                <div className="relative">
                  <button onClick={handlePrevMonth} className="absolute -left-1 top-0 p-1 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"><ChevronLeft size={14} /></button>
                  {renderCalendar(viewDate)}
                </div>
                <div className="relative">
                  <button onClick={handleNextMonth} className="absolute -right-1 top-0 p-1 hover:bg-slate-100 rounded-lg text-slate-400 z-10 transition-colors"><ChevronRight size={14} /></button>
                  {renderCalendar(addMonths(viewDate, 1))}
                </div>
              </div>
              <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start date</label>
                    <input type="text" value={startInput}
                      onChange={(e) => {
                        setStartInput(e.target.value)
                        const d = parse(e.target.value, 'MM/dd/yyyy', new Date())
                        if (isValid(d)) setTempRange(prev => ({ ...prev, start: d }))
                      }}
                      className={cn(
                        "w-28 px-3 py-1.5 bg-slate-50 border rounded-full text-[10px] font-bold text-slate-900 focus:outline-none transition-all",
                        isValid(parse(startInput, 'MM/dd/yyyy', new Date())) ? "border-slate-200 focus:border-emerald-500" : "border-rose-300 focus:border-rose-400"
                      )}
                    />
                  </div>
                  <div className="w-2 h-[1px] bg-slate-200 mt-4" />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">End date</label>
                    <input type="text" value={endInput}
                      onChange={(e) => {
                        setEndInput(e.target.value)
                        const d = parse(e.target.value, 'MM/dd/yyyy', new Date())
                        if (isValid(d)) setTempRange(prev => ({ ...prev, end: d }))
                      }}
                      className={cn(
                        "w-28 px-3 py-1.5 bg-slate-50 border rounded-full text-[10px] font-bold text-slate-900 focus:outline-none transition-all",
                        isValid(parse(endInput, 'MM/dd/yyyy', new Date())) ? "border-slate-200 focus:border-emerald-500" : "border-rose-300 focus:border-rose-400"
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                  <button onClick={handleApply} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">Apply Range</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange({ start: subDays(range.start, 1), end: subDays(range.end, 1) })} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block"><ChevronLeft size={16} /></button>
        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm min-w-[260px] h-10">
          <CalendarIcon size={16} className="text-slate-400" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{activePreset}</span>
            <span className="text-[11px] font-bold text-slate-900 leading-none truncate">{format(range.start, 'MMM d, yyyy')} - {format(range.end, 'MMM d, yyyy')}</span>
          </div>
          <ChevronDown size={14} className={cn("ml-auto text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>
        <button onClick={() => onChange({ start: addDays(range.start, 1), end: addDays(range.end, 1) })} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block"><ChevronRight size={16} /></button>
      </div>
      {typeof document !== 'undefined' && document.body
        ? createPortal(calendarPanel, document.body)
        : calendarPanel
      }
    </>
  )
}
