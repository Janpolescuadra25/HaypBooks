import fs from 'fs'
import path from 'path'

// Guard: prevent disallowed brand terms from appearing in app source code.
// Scans src/ (excluding __tests__) for case-insensitive occurrences of banned terms.

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

describe('Brand terms compliance guard', () => {
  it('frontend source must not include disallowed brand terms', () => {
    const srcRoot = path.join(process.cwd(), 'src')
    const files = listFilesRec(srcRoot)
      .filter(p => !/[\\\/]__tests__[\\\/]/.test(p))
      .filter(p => /\.(ts|tsx|js|jsx|mdx|css)$/.test(p))

    // Add case-insensitive banned terms here
    // Avoid hard-coded competitor brand mentions in source; if needed, replace with
    // a generic token here instead of literal brand names to keep the repo clean.
    const banned = [/\bcompetitor-name\b/i, /\bintuit\b/i]

    const offenders: Array<{ file: string; term: string; line: number; snippet: string }> = []
    for (const file of files) {
      const rel = toRel(file)
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split(/\r?\n/)
      lines.forEach((line, idx) => {
        for (const rx of banned) {
          const m = line.match(rx)
          if (m) {
            offenders.push({ file: rel, term: rx.source, line: idx + 1, snippet: line.trim().slice(0, 120) })
          }
        }
      })
    }

    expect({
      message: 'Disallowed brand terms found in source files',
      offenders,
    }).toEqual({ message: 'Disallowed brand terms found in source files', offenders: [] })
  })
})
