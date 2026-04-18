export type PrintTheme = {
  bg: string
  fontClass: string
  titleClass: string
  titleBorderClass: string
  draftNumClass: string
  metaLabelClass: string
  addrTitleClass: string
  addrTextClass: string
  thRowBg: string
  thCellClass: string
  tbodyRowClass: string
  tdClass: string
  totalsDividerClass: string
  totalsDueClass: string
  totalsDueAmtClass: string
  memoClass: string
}

const PRINT_THEMES: Record<string, PrintTheme> = {
  'builtin-clean': {
    bg: 'bg-white',
    fontClass: 'font-sans',
    titleClass: 'text-4xl font-bold text-gray-900 tracking-tight',
    titleBorderClass: 'border-b border-gray-300 pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-gray-700',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-gray-400 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: '',
    thCellClass: 'font-semibold text-gray-500 text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-gray-100',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t border-gray-300 pt-4',
    totalsDueClass: 'font-bold text-gray-900',
    totalsDueAmtClass: 'text-gray-900',
    memoClass: 'border-t border-gray-100 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-colorful': {
    bg: 'bg-white',
    fontClass: 'font-sans',
    titleClass: 'text-4xl font-black text-emerald-700',
    titleBorderClass: 'border-b-2 border-emerald-300 pb-6 mb-8',
    draftNumClass: 'text-emerald-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-emerald-700',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    thCellClass: 'font-bold text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-emerald-100 even:bg-emerald-50/40',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t-2 border-emerald-300 pt-4',
    totalsDueClass: 'font-black text-emerald-700',
    totalsDueAmtClass: 'text-emerald-700',
    memoClass: 'border-t border-emerald-100 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-modern': {
    bg: 'bg-gray-50',
    fontClass: 'font-sans',
    titleClass: 'text-3xl font-light text-gray-900 tracking-widest uppercase',
    titleBorderClass: 'border-b border-gray-200 pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-light text-sm mt-1',
    metaLabelClass: 'font-medium text-gray-500',
    addrTitleClass: 'text-xs font-medium uppercase tracking-widest text-gray-400 mb-2',
    addrTextClass: 'text-sm text-gray-600 space-y-0.5',
    thRowBg: 'bg-gray-100',
    thCellClass: 'font-medium text-gray-500 text-xs uppercase tracking-widest py-3',
    tbodyRowClass: 'border-b border-gray-100',
    tdClass: 'py-3.5 text-gray-600 text-sm',
    totalsDividerClass: 'border-t border-gray-200 pt-4',
    totalsDueClass: 'font-semibold text-sky-700',
    totalsDueAmtClass: 'text-sky-700',
    memoClass: 'border-t border-gray-200 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-corporate': {
    bg: 'bg-white',
    fontClass: 'font-serif',
    titleClass: 'text-4xl font-bold text-blue-950 tracking-tight uppercase',
    titleBorderClass: 'border-b-4 border-blue-950 pb-6 mb-8',
    draftNumClass: 'text-gray-500 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-blue-950',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-blue-900 mb-2',
    addrTextClass: 'text-sm text-gray-800 space-y-0.5 font-serif',
    thRowBg: 'bg-blue-950',
    thCellClass: 'font-bold text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-gray-300',
    tdClass: 'py-3 text-gray-800',
    totalsDividerClass: 'border-t-4 border-blue-950 pt-4',
    totalsDueClass: 'font-bold text-blue-950 uppercase text-sm tracking-wide',
    totalsDueAmtClass: 'text-blue-950',
    memoClass: 'border-t-2 border-blue-950 pt-6 mt-8 text-sm text-gray-500 font-serif',
  },
  'builtin-creative': {
    bg: 'bg-amber-50',
    fontClass: 'font-sans',
    titleClass: 'text-5xl font-black text-amber-500 tracking-tight',
    titleBorderClass: 'pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-black text-amber-600',
    addrTitleClass: 'text-xs font-black uppercase tracking-widest text-amber-400 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: 'bg-amber-500',
    thCellClass: 'font-black text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b-2 border-amber-100',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t-4 border-amber-500 pt-4',
    totalsDueClass: 'font-black text-amber-600',
    totalsDueAmtClass: 'text-amber-600',
    memoClass: 'border-t-2 border-amber-200 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-classic': {
    bg: 'bg-amber-50/40',
    fontClass: 'font-serif',
    titleClass: 'text-4xl font-bold text-gray-900',
    titleBorderClass: 'border-b-2 border-gray-900 pb-6 mb-8',
    draftNumClass: 'text-gray-500 font-serif text-sm mt-1',
    metaLabelClass: 'font-semibold text-gray-800',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-gray-500 mb-2',
    addrTextClass: 'text-sm text-gray-800 space-y-0.5 font-serif',
    thRowBg: '',
    thCellClass: 'font-bold text-gray-900 text-xs uppercase tracking-wide py-3 border-b-2 border-gray-900',
    tbodyRowClass: 'border-b border-gray-400',
    tdClass: 'py-3 text-gray-800 font-serif',
    totalsDividerClass: 'border-t-2 border-gray-900 pt-4',
    totalsDueClass: 'font-bold text-gray-900 uppercase font-serif',
    totalsDueAmtClass: 'text-gray-900',
    memoClass: 'border-t border-gray-400 pt-6 mt-8 text-sm text-gray-600 font-serif',
  },
}

export const getPrintTheme = (templateId: string): PrintTheme =>
  PRINT_THEMES[templateId] ?? PRINT_THEMES['builtin-clean']
