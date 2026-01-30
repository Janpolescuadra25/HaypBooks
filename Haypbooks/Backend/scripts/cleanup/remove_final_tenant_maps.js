const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..');
const targets = [
  path.resolve(repoRoot, 'prisma', 'schema.prisma'),
  path.resolve(repoRoot, 'prisma', '_auto_missing_relations_replacements.json'),
  path.resolve(repoRoot, 'prisma', '_auto_missing_relations_pass2_replacements.json'),
];
let total = 0;
for (const fp of targets) {
  if (!fs.existsSync(fp)) continue;
  let s = fs.readFileSync(fp, 'utf8');
  const before = (s.match(/@map\("tenantId"\)/g) || []).length + (s.match(/@map\(\\"tenantId\\"\)/g) || []).length + (s.match(/@@map\("Tenant"\)/g) || []).length;
  if (before === 0) continue;
  s = s.replace(/@map\("tenantId"\)/g, '');
  s = s.replace(/@map\(\\"tenantId\\"\)/g, '');
  s = s.replace(/@@map\("Tenant"\)/g, '');
  fs.writeFileSync(fp, s, 'utf8');
  console.log('Cleaned', before, 'occurrences in', path.relative(repoRoot, fp));
  total += before;
}
console.log('Total cleaned:', total);
if (total > 0) {
  console.log('\nNext: run `npx prisma generate` and run your tests.');
} else {
  console.log('No @map("tenantId") or @@map("Tenant") occurrences found in targets.');
}