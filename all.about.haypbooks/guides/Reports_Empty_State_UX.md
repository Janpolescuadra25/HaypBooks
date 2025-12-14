# Reports Empty State UX

Purpose: Provide consistent, brand-safe, and accessible empty states for reports with no data or when filters result in zero rows.

Principles
- No blank bars: Do not render filter/action bars unless filters exist and are active.
- Keep Print: Do not remove the Print button from report headers.
- Caption-first: Maintain caption above the table; when empty, still show the caption and table header for orientation.
- Accessible messaging: Announce empty state via an aria-live polite region.
- Export policy: CSV export should still produce a valid file with caption, blank spacer, header, and a Totals row with zeros if applicable.

UI Pattern
- Caption area: shows period or As-of date and totals aria-live region.
- If zero rows:
  - Show a compact card inline where the table would be:
    - Title: "No results"
    - Body: Short hint based on context, e.g., "Try a different date range or clear filters."
    - Actions (optional): "Clear filters" button if filters are present.
- Table header remains visible above the message for consistent layout and to retain column context.

Behavior Rules
- Filters present but none active: do not render the filter bar by default.
- Saved views: empty state respects saved view name but avoids duplicate headers.
- Print: prints caption + empty state message and headers; no special print-only route.

Test Notes
- Ensure aria-live announces the empty state.
- Snapshot should show caption, header, and the empty message, without a blank secondary bar.
- CSV export includes caption, blank line, header, and a Totals row (zeros), with filename via buildCsvFilename().
