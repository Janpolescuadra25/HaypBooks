#!/usr/bin/env node
// Safe codemod: replace object property keys "tenantId" -> "workspaceId" and composite names workspaceId_userId -> workspaceId_userId
// Usage: node replace-tenantid-with-workspaceid.js [--apply] [--dirs=src,test,scripts,../Frontend/src]

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
  // skip migrations, sql, prisma schema, docs, .git, node_modules
  const skip = ['/prisma/migrations', '/prisma/migrations-preview', '/prisma/backups', '/prisma/squashed.sql', '/migrations', '/node_modules/', '/.git/', '/docs/', '/prisma/']
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

  // Replace object property keys: tenantId:  -> workspaceId:
  // Use regex to catch property key with optional quotes and whitespace
  txt = txt.replace(/(["'`]?)(tenantId)\1\s*:\s*/g, function(m, q, n){
    // keep the same quoting if present
    return (q || '') + 'workspaceId' + (q || '') + ': '
  })

  // Replace composite where/unique keys workspaceId_userId -> workspaceId_userId
  txt = txt.replace(/workspaceId_userId/g, 'workspaceId_userId')

  // Replace select: { workspaceId: true } -> select: { workspaceId: true }
  txt = txt.replace(/select\s*:\s*\{([^}]*?)\btenantId\b([^}]*?)\}/g, function(m){
    return m.replace(/tenantId/g, 'workspaceId')
  })

  // Replace occurrences of " tenantId " in object property contexts like "where: { workspaceId }"
  txt = txt.replace(/where\s*:\s*\{([^}]*?)\btenantId\b([^}]*?)\}/g, function(m){
    return m.replace(/tenantId/g, 'workspaceId')
  })

  if (txt !== orig) {
    changes.push({ file: f, before: orig, after: txt })
    if (apply) fs.writeFileSync(f, txt, 'utf8')
  }
}

if (changes.length === 0) {
  console.log('No candidate changes found.')
  process.exit(0)
}

console.log(`Found ${changes.length} files with potential changes.`)
for (let i=0;i<Math.min(30, changes.length); i++) {
  const c = changes[i]
  console.log('\n---', c.file)
  const b = c.before.split('\n').slice(0,8).join('\n')
  const a = c.after.split('\n').slice(0,8).join('\n')
  console.log('--- BEFORE ---\n'+b+'\n')
  console.log('--- AFTER  ---\n'+a+'\n')
}
if (!apply) {
  console.log('\nRun with --apply to actually write these changes to disk.')
} else {
  console.log('\nApplied changes to files.')
}

process.exit(0)
