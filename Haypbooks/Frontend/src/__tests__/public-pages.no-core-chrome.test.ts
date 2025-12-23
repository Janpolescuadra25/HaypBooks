import fs from 'fs'
import path from 'path'

// This test ensures marketing/public pages don't accidentally import core chrome
// components like AppShellHeader or Sidebar.

test('public pages must not import core app chrome', () => {
  const publicDir = path.resolve(process.cwd(), 'src', 'app', '(public)')
  const files = [] as string[]

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (stat.isFile() && /\.tsx?$/.test(name)) files.push(full)
    }
  }

  walk(publicDir)

  const forbidden = [/AppShellHeader/, /Sidebar/, /layout-shell/, /className=\"layout-shell\"/]
  const violations: Array<{ file: string; matches: string[] }> = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const matches = forbidden.filter(re => re.test(content)).map(re => re.toString())
    if (matches.length) violations.push({ file: path.relative(process.cwd(), file), matches })
  }

  if (violations.length) {
    const message = ['Public pages should not import or use core app chrome:', '']
    for (const v of violations) message.push(`${v.file}: ${v.matches.join(', ')}`)
    throw new Error(message.join('\n'))
  }
})
