const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const before = (s.match(/@map\(\s*"tenantId"\s*\)/g) || []).length;
console.log('Found', before, 'occurrences');
if (before === 0) {
  console.log('No occurrences to remove.');
  process.exit(0);
}
const out = s.replace(/\s*@map\(\s*"tenantId"\s*\)/g, '');
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before, 'occurrences from', fp);
