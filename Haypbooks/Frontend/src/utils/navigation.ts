// Tiny navigation utilities to allow mocking in tests without touching jsdom Location
export function reloadPage(): void {
  if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
    window.location.reload()
  }
}

export function navigateTo(path: string): void {
  if (typeof window !== 'undefined') {
    // Use href so this is easy to reason about, and allow tests to mock this function
    window.location.href = path
  }
}
