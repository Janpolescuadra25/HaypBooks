export async function retryRequest<T>(fn: () => Promise<T>, attempts = 3, delayMs = 200): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fn()
      return res
    } catch (err) {
      lastError = err
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }
  // If we've exhausted attempts, throw the last error
  throw lastError
}
