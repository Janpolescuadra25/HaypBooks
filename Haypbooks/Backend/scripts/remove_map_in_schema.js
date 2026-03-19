const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(file, 'utf8');
const before = (s.match(/@map\(\s*"tenantId"\s*\)/g) || []).length;
if (before === 0) { console.log('No @map("tenantId") occurrences found.'); process.exit(0) }
const out = s.replace(/\s*@map\(\s*"tenantId"\s*\)/g, '');
fs.writeFileSync(file, out, 'utf8');
console.log('Removed', before, '@map("tenantId") occurrences from schema.prisma');
