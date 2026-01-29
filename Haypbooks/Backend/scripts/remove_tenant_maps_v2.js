const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const beforeCount = (s.match(/@map\(\s*"tenantId"\s*\)/g) || []).length;
console.log('Found @map("tenantId") occurrences:', beforeCount);
let out = s.replace(/@map\(\s*"tenantId"\s*\)/g, '');
out = out.replace(/@@map\(\s*"Tenant"\s*\)/g, '');
const afterCount = (out.match(/@map\(\s*"tenantId"\s*\)/g) || []).length;
if (beforeCount === 0) {
  console.log('No @map("tenantId") occurrences found — nothing to do');
  process.exit(0);
}
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', beforeCount - afterCount, 'occurrences. Remaining:', afterCount);
