const fs = require('fs')
const path = require('path')

const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma')
const outPath = path.resolve(__dirname, './expected_schema.json')

const schemaContent = fs.readFileSync(schemaPath, 'utf8')

function parseModels(schema) {
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\n\}/g
  const models = []
  let m
  while ((m = modelRegex.exec(schema)) !== null) {
    const name = m[1]
    const body = m[2]
    const fields = []
    const fieldRegex = /\n\s*([A-Za-z0-9_]+)\s+([A-Za-z0-9_\[\]<>?@,()\s"']+)/g
    let f
    while ((f = fieldRegex.exec(body)) !== null) {
      const fieldName = f[1]
      fields.push(fieldName)
    }
    // detect primary key(s)
    let pkFields = []
    const singlePkRegex = new RegExp(`\n\\s*([A-Za-z0-9_]+)[^\n]*@id`, 'g')
    const sp = singlePkRegex.exec(body)
    if (sp) pkFields = [sp[1]]
    // composite pk: @@id([a, b])
    const compositeRegex = /@@id\s*\(\s*\[([^\]]+)\]\s*\)/g
    const cp = compositeRegex.exec(body)
    if (cp) {
      const list = cp[1].split(',').map(s => s.trim().replace(/"/g, ''))
      pkFields = list
    }
    models.push({ name, fields, pkFields })
  }
  return models
}

function defaultRequiredColumns(model) {
  const defaults = []
  // prefer primary key fields if found
  if (model.pkFields && model.pkFields.length > 0) {
    defaults.push(...model.pkFields)
  } else {
    defaults.push('id')
  }
  if (model.fields.includes('tenantId') && !defaults.includes('tenantId')) defaults.push('tenantId')
  if (model.fields.includes('createdAt') && !defaults.includes('createdAt')) defaults.push('createdAt')
  return defaults
}

const models = parseModels(schemaContent)
const manifest = models.map(m => ({ name: m.name, tenantScoped: m.fields.includes('tenantId'), requiredColumns: defaultRequiredColumns(m), expectsTenantIndex: m.fields.includes('tenantId') }))

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n')
console.log('Wrote expected schema manifest with', manifest.length, 'models to', outPath)
