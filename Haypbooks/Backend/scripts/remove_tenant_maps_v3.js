const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const before = (s.match(/@map\(\"tenantId\"\)/g) || []).length;
console.log('Before count:', before);
const out = s.split('@map("tenantId")').join('');
const after = (out.match(/@map\(\"tenantId\"\)/g) || []).length;
if (before === after) {
  console.log('No changes');
  process.exit(0);
}
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before - after, 'occurrences');
