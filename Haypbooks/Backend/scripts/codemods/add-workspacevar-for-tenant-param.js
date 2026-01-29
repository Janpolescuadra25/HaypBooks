#!/usr/bin/env node
// Insert `const workspaceId = tenantId` into functions that accept `tenantId: string` and reference `workspaceId` inside
// Usage: node add-workspacevar-for-tenant-param.js [--apply] [--dirs=src,test]

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const apply = !!argv.apply
const dirs = (argv.dirs || 'src,test').split(',')
const root = path.resolve(__dirname, '..', '..')
const exts = ['.ts', '.tsx']

function walk(dir) {
  const res = []
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f)
    const st = fs.statSync(fp)
    if (st.isDirectory()) {
      res.push(...walk(fp))
    } else if (st.isFile() && exts.includes(path.extname(fp))) {
      res.push(fp)
    }
  }
  return res
}

function shouldProcess(file) {
  const skip = ['/prisma/', '/node_modules/', '/.git/', '/docs/']
  for (const s of skip) if (file.includes(s)) return false
  return true
}

const candidates = []
for (const d of dirs) {
  const dirPath = path.join(root, d)
  if (fs.existsSync(dirPath)) candidates.push(...walk(dirPath))
}

const changes = []
for (const f of candidates) {
  if (!shouldProcess(f)) continue
  let txt = fs.readFileSync(f, 'utf8')
  const orig = txt
  // Find function signatures with tenantId param
  // This is heuristic: looks for "async xxx(tenantId: string" and body contains workspaceId
  txt = txt.replace(/async\s+([a-zA-Z0-9_]+)\s*\([^)]*tenantId\s*:\s*string[^)]*\)\s*\{([\s\S]*?)\n\s*([\w\W]*?)\}/g, function(m, fn, body){
    if (m.includes('workspaceId')) {
      // insert const workspaceId = tenantId after the opening brace
      if (body.trim().startsWith('//')) {
        // be conservative
      }
      const newBody = '\n    const workspaceId = tenantId\n' + body
      return m.replace(body, newBody)
    }
    return m
  })

  if (txt !== orig) {
    changes.push({ file: f, before: orig, after: txt })
    if (apply) fs.writeFileSync(f, txt, 'utf8')
  }
}

if (changes.length === 0) {
  console.log('No functions found that match the insertion criteria.')
  process.exit(0)
}

console.log(`Found ${changes.length} files to update.`)
for (let i=0;i<Math.min(30, changes.length); i++) {
  const c = changes[i]
  console.log('\n---', c.file)
  console.log('--- BEFORE snippet ---\n'+c.before.split('\n').slice(0,12).join('\n'))
  console.log('--- AFTER snippet  ---\n'+c.after.split('\n').slice(0,12).join('\n'))
}
if (!apply) console.log('\nRun with --apply to commit these changes to disk.')
else console.log('\nApplied changes to files.')

process.exit(0)
