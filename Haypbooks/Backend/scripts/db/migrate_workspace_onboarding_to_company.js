const { PrismaClient } = require('@prisma/client');
const argv = require('minimist')(process.argv.slice(2));
const APPLY = argv.apply || false;

const mapping = {
  firmName: 'firmName',
  businessType: 'businessType',
  industry: 'industry',
  startDate: 'startDate',
  fiscalStart: 'fiscalYearStart',
  country: 'country',
  address: 'address',
  taxId: 'taxId',
  vatRegistered: 'vatRegistered',
  vatRate: 'vatRate',
  logoUrl: 'logoUrl',
  invoicePrefix: 'invoicePrefix',
  defaultPaymentTerms: 'defaultPaymentTerms',
  accountingMethod: 'accountingMethod',
  name: 'name'
};

(async function(){
  const prisma = new PrismaClient();
  try{
    console.log('Mode:', APPLY ? 'apply' : 'dry-run (no writes)');
    // Find workspaces with any non-null suspect column
    const cols = Object.keys(mapping).map(c => `w."${c}" IS NOT NULL`).join(' OR ');
    const sql = `SELECT w.id, ${Object.keys(mapping).map(c=>`w."${c}"`).join(', ')} FROM "Workspace" w WHERE ${cols}`;
    const rows = await prisma.$queryRawUnsafe(sql);
    console.log('Workspaces with legacy onboarding values found:', rows.length);
    for(const r of rows){
      const workspaceId = r.id;
      // fetch companies
      const comps = await prisma.company.findMany({ where: { workspaceId } });
      console.log(`\nWorkspace ${workspaceId} -> companies: ${comps.length}`);
      const wsValues = {};
      for(const k of Object.keys(mapping)){ wsValues[k] = r[k]; }
      console.log('Workspace values:', wsValues);

      if(comps.length === 1){
        const comp = comps[0];
        const updates = {};
        const notes = [];
        for(const [wsCol, compCol] of Object.entries(mapping)){
          const wsVal = wsValues[wsCol];
          if(wsVal === null || wsVal === undefined) continue;
          if(compCol && comp.hasOwnProperty(compCol)){
            // only set if company field is null
            if(comp[compCol] === null || comp[compCol] === undefined){
              updates[compCol] = wsVal;
            } else {
              notes.push(`${compCol} (workspace->company) skipped because company already has value`);
            }
          } else {
            notes.push(`${wsCol}: ${JSON.stringify(wsVal)}`);
          }
        }
        // Special handling for taxFilingFrequency & taxExempt which don't map directly
        // Collect any extra workspace fields not in mapping (taxFilingFrequency, taxExempt)
        const extras = {};
        for(const extra of ['taxFilingFrequency','taxExempt']){
          if(r[extra] !== null && r[extra] !== undefined){ extras[extra] = r[extra]; }
        }
        if(Object.keys(extras).length) notes.push('extras:' + JSON.stringify(extras));

        if(!APPLY){
          console.log('DRY RUN - would update Company', comp.id, 'with', updates, 'notes:', notes);
          console.log('DRY RUN - would clear workspace columns for', workspaceId);
        } else {
          await prisma.$transaction(async (tx) => {
            if(Object.keys(updates).length){
              console.log('Updating Company', comp.id, 'with', updates);
              await tx.company.update({ where: { id: comp.id }, data: updates });
            }
            if(notes.length){
              const noteText = `Migrated from Workspace ${workspaceId} on ${new Date().toISOString()}: ${notes.join('; ')}`;
              console.log('Appending migration note to Company:', comp.id, 'note:', noteText);
              await tx.company.update({ where: { id: comp.id }, data: { migrationNote: (comp.migrationNote || '') + '\n' + noteText } });
            }
            // Clear workspace columns that we moved or extras (set to NULL)
            const clearCols = Object.keys(mapping).concat(['taxFilingFrequency','taxExempt']);
            const clearData = {};
            for(const c of clearCols){ clearData[c] = null; }
            console.log('Clearing workspace columns for', workspaceId);
            // Use raw SQL to clear columns because some Workspace columns may not exist in the current Prisma model
            const setPairs = clearCols.map(c => `"${c}" = NULL`).join(', ');
            const updateSql = `UPDATE "Workspace" SET ${setPairs} WHERE id = '${workspaceId}'`;
            await tx.$executeRawUnsafe(updateSql);
          });
          console.log('APPLY complete for workspace', workspaceId);
        }
      } else if(comps.length === 0){
        console.log('No companies for workspace', workspaceId, '- skipping automated migration (manual review)');
      } else {
        console.log('Multiple companies for workspace', workspaceId, '- skipping automated migration (manual review)');
      }
    }
    console.log('\nFinished.');
  }catch(e){ console.error('Error during migration:', e.message); } finally { await prisma.$disconnect(); }
})();

// Usage:
// node migrate_workspace_onboarding_to_company.js         -> dry-run
// node migrate_workspace_onboarding_to_company.js --apply -> perform changes
