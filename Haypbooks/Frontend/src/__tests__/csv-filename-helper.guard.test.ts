import fs from 'fs'
import path from 'path'

// Guard: ensure export routes use the shared CSV filename helper to avoid manual filename drift.
// This test scans API export routes and expects to find at least one reference to buildCsvFilename(...).
// If a route intentionally does not download a file (edge case), it should be excluded via allowlist below.

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

describe('CSV filename helper guard', () => {
  it('all export routes should use buildCsvFilename', () => {
    const apiRoot = path.join(process.cwd(), 'src', 'app', 'api')
    const files = listFilesRec(apiRoot).filter(p => /[\\\/]export[\\\/]route\.ts$/.test(p))

    // Allowlist for routes that do not produce downloadable CSV/PDF files (if any emerge later)
    const allowlist = new Set<string>([])

    const offenders: string[] = []
    for (const file of files) {
      const rel = toRel(file)
      if (allowlist.has(rel)) continue
      const content = fs.readFileSync(file, 'utf8')
      const referencesHelper = /buildCsvFilename\s*\(/.test(content)
      if (!referencesHelper) offenders.push(rel)
    }

    expect({
      message: 'Expected export routes to use shared buildCsvFilename(). Missing in:',
      offenders,
    }).toEqual({ message: 'Expected export routes to use shared buildCsvFilename(). Missing in:', offenders: [] })
  })
})
