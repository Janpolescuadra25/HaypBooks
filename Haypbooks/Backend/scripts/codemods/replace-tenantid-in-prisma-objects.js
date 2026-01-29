#!/usr/bin/env node
// Safer codemod: replace tenantId->workspaceId only inside prisma query object contexts
//  - Matches patterns like data: { ... workspaceId ... }, where: { workspaceId: ... }, select: { workspaceId: true }
//  - Does not modify function parameters or unrelated variable names
// Usage: node replace-tenantid-in-prisma-objects.js [--apply] [--dirs=src,test,scripts]

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const apply = !!argv.apply
const dirs = (argv.dirs || 'src,test,scripts').split(',')
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

function shouldProcess(file) {
  const skip = ['/prisma/migrations', '/prisma/migrations-preview', '/prisma/backups', '/prisma/squashed.sql', '/node_modules/', '/.git/', '/docs/']
  for (const s of skip) if (file.includes(s)) return false
  return true
}

const candidates = []
for (const d of dirs) {
  const dirPath = path.join(root, d)
  if (fs.existsSync(dirPath)) {
    candidates.push(...walk(dirPath))
  }
}

const changes = []
for (const f of candidates) {
  if (!shouldProcess(f)) continue
  let txt = fs.readFileSync(f, 'utf8')
  let orig = txt

  // Regex to find data: { ... } or where: { ... } or select: { ... }
  // This is a heuristic, not full AST parsing. We'll limit replacement to those inner blocks.
  txt = txt.replace(/(data\s*:\s*\{)([\s\S]*?)(\})/g, function(m, p1, inner, p3){
    const replaced = inner.replace(/\btenantId\b/g, 'workspaceId')
    if (replaced !== inner) return p1 + replaced + p3
    return m
  })

  txt = txt.replace(/(where\s*:\s*\{)([\s\S]*?)(\})/g, function(m, p1, inner, p3){
    const replaced = inner.replace(/\btenantId\b/g, 'workspaceId')
    if (replaced !== inner) return p1 + replaced + p3
    return m
  })

  txt = txt.replace(/(select\s*:\s*\{)([\s\S]*?)(\})/g, function(m, p1, inner, p3){
    const replaced = inner.replace(/\btenantId\b/g, 'workspaceId')
    if (replaced !== inner) return p1 + replaced + p3
    return m
  })

  // Also change composite keys in where: { workspaceId_userId: { ... } }
  txt = txt.replace(/workspaceId_userId/g, 'workspaceId_userId')

  if (txt !== orig) {
    changes.push({ file: f, before: orig, after: txt })
    if (apply) fs.writeFileSync(f, txt, 'utf8')
  }
}

if (changes.length === 0) {
  console.log('No candidate changes found by safer codemod.')
  process.exit(0)
}

console.log(`Safer codemod found ${changes.length} files with potential changes.`)
for (let i=0;i<Math.min(50, changes.length); i++) {
  const c = changes[i]
  console.log('\n---', c.file)
  const diffBefore = c.before.split('\n').slice(0,8).join('\n')
  const diffAfter = c.after.split('\n').slice(0,8).join('\n')
  console.log('--- BEFORE (snippet) ---\n'+diffBefore+'\n')
  console.log('--- AFTER  (snippet) ---\n'+diffAfter+'\n')
}
if (!apply) console.log('\nRun with --apply to commit these changes to disk.')
else console.log('\nApplied changes to files.')

process.exit(0)
