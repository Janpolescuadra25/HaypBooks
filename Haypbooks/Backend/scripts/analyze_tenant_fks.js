const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// Parse def like 'FOREIGN KEY ("tenantId", "assigneeId") REFERENCES "WorkspaceUser"("tenantId", "userId") ON UPDATE CASCADE ON DELETE RESTRICT'
function parseDef(def) {
  const refMatch = def.match(/REFERENCES\s+"?([A-Za-z0-9_]+)"?\s*\(([^)]+)\)/i)
  const localMatch = def.match(/FOREIGN KEY\s*\(([^)]+)\)/i)
  if (!refMatch || !localMatch) return null
  const refTable = refMatch[1]
  const refCols = refMatch[2].split(',').map(s=>s.replace(/"/g,'').trim())
  const localCols = localMatch[1].split(',').map(s=>s.replace(/"/g,'').trim())
  return { refTable, refCols, localCols }
}

async function run(){
  try{
    const constraints = await p.$queryRaw`SELECT conname, conrelid::regclass::text AS table_from, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE contype='f' AND (pg_get_constraintdef(oid) ILIKE '%tenantId%' OR pg_get_constraintdef(oid) ILIKE '%workspaceId%')`
    const report = []
    for(const c of constraints){
      const parsed = parseDef(c.def)
      if(!parsed){
        report.push({ conname: c.conname, table_from: c.table_from, problem: 'could not parse def', def: c.def })
        continue
      }
      // get data types for local cols
      const localTypes = []
      for(const col of parsed.localCols){
        const lt = await p.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${c.table_from.replace('"','').replace('"','')} AND column_name=${col}`
        localTypes.push({ col, type: lt[0]?.data_type || 'MISSING' })
      }
      const refTypes = []
      for(const col of parsed.refCols){
        const rt = await p.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${parsed.refTable} AND column_name=${col}`
        refTypes.push({ col, type: rt[0]?.data_type || 'MISSING' })
      }
      report.push({ conname: c.conname, table_from: c.table_from, parsed, localTypes, refTypes })
    }
    console.dir(report, { depth: 6 })
  }catch(e){
    console.error('Error:', e.message)
  }finally{await p.$disconnect()}
}
run()
