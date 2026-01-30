const fs = require('fs');
const path = require('path');
const fp = path.resolve(__dirname, '..', 'prisma', '_auto_missing_relations_replacements.json');
let s = fs.readFileSync(fp, 'utf8');
// JSON contains escaped quotes, so match the literal sequence with backslashes: @map(\"tenantId\")
const before = (s.match(/@map\(\\\"tenantId\\\"\)/g) || []).length;
if (before === 0) { console.log('No @map("tenantId") occurrences found in', fp); process.exit(0); }
const out = s.split('@map(\\\"tenantId\\\")').join('');
fs.writeFileSync(fp, out, 'utf8');
const after = (out.match(/@map\(\\\"tenantId\\\"\)/g) || []).length;
console.log('Removed', before - after, '@map("tenantId") occurrences from', fp);