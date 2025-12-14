import fs from 'fs'
import path from 'path'

// Guard: prevent reintroduction of inline currency formatting in runtime code
// Allowed: tests may mock formatting; we only scan non-test source files.
describe('Currency formatting guard', () => {
  test('no inline currency toLocaleString in runtime src', () => {
    const root = path.join(process.cwd(), 'src')
    const offenders: string[] = []
    function walk(dir: string) {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name)
        const rel = path.relative(root, full)
        if (name === 'node_modules' || name === '.next') continue
        if (rel.includes(`__tests__${path.sep}`) || rel.startsWith('__tests__')) continue
        const stat = fs.statSync(full)
        if (stat.isDirectory()) walk(full)
        else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
          const txt = fs.readFileSync(full, 'utf8')
          // Look for toLocaleString calls that include the word 'currency'
          if (/toLocaleString\([^)]*currency/i.test(txt)) {
            offenders.push(path.relative(process.cwd(), full))
          }
        }
      }
    }
    if (fs.existsSync(root)) walk(root)
    if (offenders.length) {
      throw new Error(`Inline currency formatting detected in:\n${offenders.join('\n')}`)
    }
  })
})
