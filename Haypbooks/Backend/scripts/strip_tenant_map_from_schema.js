const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(fp, 'utf8');
const pattern = /@map\(\s*["'`]tenantId["'`]\s*\)/g;
const before = (s.match(pattern) || []).length;
if(before === 0){ console.log('No @map("tenantId") occurrences found in', fp); process.exit(0) }
const out = s.replace(pattern, '');
fs.writeFileSync(fp, out, 'utf8');
console.log('Removed', before, '@map("tenantId") occurrences from', fp);