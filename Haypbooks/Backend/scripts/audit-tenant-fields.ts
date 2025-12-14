import fs from 'fs';
import path from 'path';

// Attempt to locate prisma/schema.prisma starting from process.cwd().
function findSchema(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'prisma', 'schema.prisma');
    if (fs.existsSync(candidate)) return candidate;
    // Try common project subpaths
    const candidate2 = path.join(dir, '..', '..', 'prisma', 'schema.prisma');
    if (fs.existsSync(candidate2)) return candidate2;
    const candidate3 = path.join(dir, '..', '..', '..', 'prisma', 'schema.prisma');
    if (fs.existsSync(candidate3)) return candidate3;
    dir = path.dirname(dir);
  }
  return null;
}

const schemaPath = findSchema(process.cwd());
if (!schemaPath || !fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found; looked under process.cwd() and parents.');
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

const modelRegex = /model\s+([A-Za-z0-9_]+)\s+\{([\s\S]*?)\n\}/g;
const scalarTypes = new Set(["String", "Int", "Float", "Decimal", "Boolean", "DateTime", "Bytes", "Json", "BigInt"]);

const models: Record<string, {name: string; body: string; hasTenantId: boolean; hasTenantRelation: boolean; referencedModels: Set<string>}> = {};
let match;
while ((match = modelRegex.exec(schema)) !== null) {
  const [, name, body] = match;
  const lines = body.split('\n').map(l => l.trim());
  const hasTenantId = lines.some(l => l.startsWith('tenantId '));
  const hasTenantRelation = lines.some(l => /^tenant\s+Tenant\b/.test(l));
  const referencedModels = new Set<string>();
  for (const line of lines) {
    const fieldMatch = /^([a-zA-Z0-9_]+)\s+([A-Za-z0-9_?\[\]]+)/.exec(line);
    if (!fieldMatch) continue;
    const typeRaw = fieldMatch[2];
    const type = typeRaw.replace(/\?|\[|\]|\[\]/g, '');
    if (type && !scalarTypes.has(type) && /^[A-Z]/.test(type)) {
      referencedModels.add(type);
    }
  }
  models[name] = {name, body, hasTenantId, hasTenantRelation, referencedModels};
}

const tenantScopedModels = new Set<string>();
for (const mName of Object.keys(models)) {
  const m = models[mName];
  if (m.hasTenantId || m.hasTenantRelation) tenantScopedModels.add(mName);
}

// Models that are intentionally global and should not have tenantId.
const allowedToBeGlobal = new Set(["AccountType","ApiTokenRevocation","Currency","ExchangeRate","DeadLetter","JobAttempt","OnboardingStep","Otp","SchemaMigration","Session","TaxJurisdiction","User","UserSecurityEvent","Tenant"]);
const missingTenant: Array<{model: string; refsTenantModels: string[]; referencedModels: string[]}> = [];
for (const mName of Object.keys(models).sort()) {
  const m = models[mName];
  if (!m.hasTenantId && !m.hasTenantRelation && !allowedToBeGlobal.has(mName)) {
    missingTenant.push({
      model: mName,
      refsTenantModels: [...m.referencedModels].filter(r => tenantScopedModels.has(r)),
      referencedModels: [...m.referencedModels].sort(),
    });
  }
}

console.log('\nTenant-scoped Models (have tenantId or tenant relation):');
console.log([...tenantScopedModels].sort().join(', ') || '<none>');

console.log('\n\nModels missing tenantId/tenant relation: ' + missingTenant.length);
for (const item of missingTenant) {
  console.log(`\n- ${item.model}`);
  if (item.refsTenantModels.length) {
    console.log(`  * References tenant-scoped models: ${item.refsTenantModels.join(', ')}`);
    console.log('  * Recommendation: Consider adding tenantId and creating migration to populate it');
  } else if (item.referencedModels.length) {
    console.log(`  * References non-tenant models: ${item.referencedModels.join(', ')}`);
  } else {
    console.log('  * No references to other models, inspect for global/shared use');
  }
}

if (missingTenant.length > 0) {
  console.error('\nAudit found models missing tenant scoping: ' + missingTenant.length)
  process.exit(1)
}
console.log('\nDone.');
