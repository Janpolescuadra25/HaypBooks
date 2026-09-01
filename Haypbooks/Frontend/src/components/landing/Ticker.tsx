"use client";

const NOTES = [
  "NEW — SMART BANK RECONCILIATION IS LIVE",
  "INTRODUCING — PRACTICE HUB FOR ACCOUNTING FIRMS",
  "GONE — MANUAL DATA ENTRY, FOR GOOD",
  "FASTER — PERIOD CLOSE, UP TO 12×",
  "FREE — FULL ACCESS FOR 14 DAYS, NO CARD NEEDED",
  "IN SYNC — MULTI-CURRENCY EXCHANGE RATES, LIVE",
  "NEW — TAX-READY REPORTING TEMPLATES",
  "SECURE — BANK-GRADE ENCRYPTION + FULL AUDIT TRAIL",
];

export default function Ticker() {
  const items = [...NOTES, ...NOTES];
  return (
    <div className="relative z-10 -rotate-[0.6deg] my-2" aria-hidden="true">
      <div className="bg-navy-800 border-y-4 border-quest-500 py-3 overflow-hidden shadow-[0_10px_40px_rgba(8,22,49,0.25)]">
        <div className="hb-marquee-track gap-0">
          {items.map((n, i) => (
            <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap">
              <span className="w-2 h-2 bg-quest-400 rotate-45 shrink-0" />
              <span className="font-pixel text-[10px] text-white/90">{n}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
