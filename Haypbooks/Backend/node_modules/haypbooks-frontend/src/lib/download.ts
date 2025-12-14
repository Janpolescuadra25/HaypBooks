export function getFilenameFromContentDisposition(cd: string | null | undefined): string | null {
  if (!cd) return null
  // Try filename="..." first
  const matchQuoted = cd.match(/filename\*=UTF-8''([^;\n\r]+)|filename="([^"]+)"|filename=([^;\n\r]+)/i)
  if (!matchQuoted) return null
  const candidate = decodeURIComponent(matchQuoted[1] || matchQuoted[2] || matchQuoted[3] || '').trim()
  return candidate || null
}

export async function downloadFromResponse(res: Response, fallbackName = 'download') {
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    const cd = (res.headers?.get ? res.headers.get('Content-Disposition') : null) as string | null
    a.download = getFilenameFromContentDisposition(cd) || fallbackName
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    URL.revokeObjectURL(url)
  }
}