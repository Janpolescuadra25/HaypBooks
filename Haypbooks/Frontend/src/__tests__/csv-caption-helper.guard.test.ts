import fs from 'fs'
import path from 'path'

// Guard: ensure export routes import shared caption helpers to avoid manual caption drift.
// Allowed exceptions: aging summaries intentionally format captions differently.

function listFilesRec(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFilesRec(full))
    else out.push(full)
  }
  return out
}

function toRel(p: string): string {
  return p.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/', '')
}

describe('CSV caption helpers guard', () => {
  it('most export routes should import a caption helper', () => {
    const apiRoot = path.join(process.cwd(), 'src', 'app', 'api')
    const files = listFilesRec(apiRoot).filter(p => /[\\\/]export[\\\/]route\.ts$/.test(p))

    // Explicit allowlist for routes that purposely manage caption/labels differently
    const allowlist = new Set([
      'src/app/api/reports/ar-aging/export/route.ts',
      'src/app/api/reports/ap-aging/export/route.ts',
    ])

    const offenders: string[] = []
    for (const file of files) {
      const rel = toRel(file)
      if (allowlist.has(rel)) continue
      const content = fs.readFileSync(file, 'utf8')
      const hasHelperCall = /buildCsvCaption\s*\(|buildCsvRangeOrDate\s*\(/.test(content)
      const hasExplicitImport = /from\s+['"]@\/lib\/report-helpers['"]/.test(content)
      if (!hasHelperCall || !hasExplicitImport) offenders.push(rel)
    }

    // If any offenders found, fail with a helpful message
    expect({
      message: 'Expected export routes to use shared caption helpers. Missing in:',
      offenders,
    }).toEqual({ message: 'Expected export routes to use shared caption helpers. Missing in:', offenders: [] })
  })
})
