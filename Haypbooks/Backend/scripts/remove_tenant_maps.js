const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const before = s;
// Remove exact @map("tenantId") occurrences
s = s.replace(/\s*@map\("tenantId"\)/g, '');
// Remove any @@map("Tenant") occurrences
s = s.replace(/@@map\("Tenant"\)/g, '');
// Normalize multiple spaces (keep formatting tidy)
s = s.replace(/ +\n/g, '\n');
if (s === before) {
  console.log('No changes made (no @map("tenantId") or @@map("Tenant") found)');
  process.exit(0);
}
fs.writeFileSync(fp, s, 'utf8');
console.log('Removed @map("tenantId") and @@map("Tenant") occurrences from schema.prisma');
