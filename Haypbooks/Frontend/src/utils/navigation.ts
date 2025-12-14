// Tiny navigation utilities to allow mocking in tests without touching jsdom Location
export function reloadPage(): void {
  if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
    window.location.reload()
  }
}
