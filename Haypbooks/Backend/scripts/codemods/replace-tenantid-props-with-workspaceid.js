#!/usr/bin/env node
// Replace occurrences of `.tenantId` with `.workspaceId` and object property `tenantId:` with `workspaceId:`
// Usage: node replace-tenantid-props-with-workspaceid.js [--apply] [--dirs=src,test]

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const apply = !!argv.apply
const dirs = (argv.dirs || 'src,test').split(',')
const root = path.resolve(__dirname, '..', '..')
const exts = ['.ts', '.tsx', '.js', '.jsx']

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

const skipDirs = ['/prisma/', '/node_modules/', '/.git/', '/migrations/']
function shouldProcess(file) {
  for (const s of skipDirs) if (file.includes(s)) return false
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
  // Replace .tenantId with .workspaceId
  txt = txt.replace(/\.tenantId(?![a-zA-Z0-9_])/g, '.workspaceId')
  // Replace object property tenantId: with workspaceId:
  txt = txt.replace(/([\{,\s])tenantId\s*:/g, '$1workspaceId:')

  if (txt !== orig) {
    changes.push({ file: f, before: orig, after: txt })
    if (apply) fs.writeFileSync(f, txt, 'utf8')
  }
}

if (changes.length === 0) {
  console.log('No property occurrences found to update.')
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
