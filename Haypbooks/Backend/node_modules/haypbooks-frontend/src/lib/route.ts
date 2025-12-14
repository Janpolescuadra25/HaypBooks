// Centralized route/href helper to avoid repetitive "as any" casts spread across the codebase.
// Use this function when passing literal strings to Next.js router/link APIs that we need
// to assert as the expected type in a few places - keeping the cast centralized makes
// future changes (and stricter types) easier to update.
export function toHref(href: string) {
  return href as unknown as any
}

export default toHref
